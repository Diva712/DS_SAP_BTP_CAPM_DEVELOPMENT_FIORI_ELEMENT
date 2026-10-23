const cds = require('@sap/cds');
const { message } = require('@sap/cds/lib/log/cds-error');
const { SELECT, UPDATE } = require('@sap/cds/lib/ql/cds-ql');

module.exports = cds.service.impl(function () {
    this.before('CREATE', 'ItemSet', (req) => {
        if (!req.data.NetPrice || req.data.NetPrice <= 0) {
            req.error(400, 'Hello Dilbag Singh, Net price must be greater than zero');
        }
    });

    // this.on('READ', 'OrderSet', async (req) => {
    //     const tx = cds.tx(req);
    //     return await tx.run(
    //         SELECT.from('ds.salesapp.SalesOrder').where({ Status: 'Open' })
    //     )
    // });

    this.before('NEW', 'CustomerSet.drafts', async (req) => {
        const tx = cds.tx(req);
        await tx.run(UPDATE('ds.salesapp.Counters').set({ value: { '+=': 1 } }).where({ name: 'Customer' }))
        const { value } = await tx.run(SELECT.one.from('ds.salesapp.Counters').where({ name: 'Customer' }))
        req.data.Cust_id = `CUST${value}`;
    });

    this.before('SAVE', 'CustomerSet.drafts', (req) => {
        if (!req.data.CustomerName) {
            req.error(400, 'Customer Name is mandatory', 'in/CustomerName');
        }
    });

    this.before('SAVE', 'CustomerSet.drafts', (req) => {

        const { Email, PhoneNumber } = req.data;

        if (!Email) {
            req.error(400, 'Email is mandatory', 'in/Email');
        } else {
            const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegEx.test(Email)) {
                req.error(400, 'Enter a valid email', 'in/Email');
            }
        }

        if (!PhoneNumber) {
            req.error(400, 'Phone Number is mandatory', 'in/PhoneNumber');
        } else {
            const phoneRegEx = /^\+?[0-9]{10,15}$/;

            if (!phoneRegEx.test(PhoneNumber)) {
                req.error(400, 'Enter a valid Phone Number', 'in/PhoneNumber');
            }
        }
    });

    this.before('NEW', 'OrderSet.drafts', async (req) => {
        const tx = cds.tx(req);
        await tx.run(UPDATE('ds.salesapp.Counters').set({ value: { '+=': 1 } }).where({ name: 'Order' }))
        const { value } = await tx.run(SELECT.one.from('ds.salesapp.Counters').where({ name: 'Order' }))
        const cust_id = req.data.customer_Cust_id;
        req.data.Order_Id = `${cust_id}SO${value}`;

        req.data.Status = 'Open';
        req.data.OrderDate = new Date();
    });

    this.before('PATCH', 'ItemSet.drafts', async (req) => {
        //get the existing data from db
        const items = await SELECT.one.from('CatalogService.ItemSet.drafts').where({
            Item_Id: req.data.Item_Id,
            Parent_Order_Id: req.data.Parent_Order_Id
        })

        //getting the updated data from the request
        const {Quantity, NetPrice} = req.data;

        const qty = Quantity ?? items?.Quantity ?? 0;
        const netPrice = NetPrice ?? items?.NetPrice ?? 0.0;

        req.data.LineTotal = qty * netPrice;


    });

        this.after(['NEW','PATCH','DELETE'], 'ItemSet.drafts', async (data,req) => {

        const parentId = data.Parent_Order_Id || req.data.Parent_Order_Id; 
        console.log("parent id", parentId);
        const items = await SELECT.from('CatalogService.ItemSet.drafts')
            .where({
                Parent_Order_Id: parentId
            });
        
        let totalValue = 0.00;
       items.forEach(item => {
            totalValue += Number(item.LineTotal || 0);
        });
        
        await UPDATE('CatalogService.OrderSet.drafts')
                    .set({NetValue : totalValue})
                    .where({Order_Id : parentId });

    });


    this.before('NEW', 'ItemSet.drafts', async (req) => {
        const { Parent_Order_Id } = req.data;
        const existingItems = await SELECT.from('CatalogService.ItemSet.drafts')
            .where({ Parent_Order_Id: Parent_Order_Id })
            .orderBy('Item_Id desc');

        if (existingItems.length === 0) {
            req.data.Item_Id = 10;
        } else {
            const highestItem = existingItems[0].Item_Id;
            req.data.Item_Id = highestItem + 10;
        }
    });

    this.after('READ', 'ItemSet', (items) => {
        for (const item of items) {
            item.Total_Price = `${item.Quantity * item.NetPrice} ${item.Currency_code}`;
        }
    });

    this.on('markOrderAsPaid', 'OrderSet', async (req) => {
        const id = req.params[1].Order_Id;
        const tx = cds.tx(req);

        await tx.run(
            UPDATE('ds.salesapp.SalesOrder').set({ Status: 'Paid' }).where({ Order_Id: id })
        );
        const updatedOrder = await tx.run(
            SELECT.one.from('ds.salesapp.SalesOrder').where({ Order_Id: id })
        );
        return updatedOrder;
    });

    this.on('cancelOpenOrderForDate', async (req) => {
        req.user.is('Editor') || req.reject(403)
        const { day, month, year } = req.data;
        const tx = cds.tx(req);

        const formatDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const updatedOrders = await tx.run(
            UPDATE('ds.salesapp.SalesOrder')
                .set({ Status: 'Cancelled' })
                .where({ Status: 'Open', OrderDate: formatDate })
        );
        return { message: `${updatedOrders} orders are cancelled for ${day}-${month}-${year}` };
    });


    this.on('customerLoyaltyLevel', 'CustomerSet', async (req) => {

    const id = req.params[0].Cust_id;
    const tx = cds.tx(req);

    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Date field ke liye yyyy-mm-dd format
    const fromDate = oneYearAgo.toISOString().split('T')[0];

    const result = await tx.run(
        SELECT.one
            .from('ds.salesapp.SalesOrder')
            .columns('sum(NetValue) as Total')
            .where({
                customer_Cust_id: id,
                OrderDate: { '>=': fromDate }
            })
    );

    const total = Number(result?.Total || 0);

    let message = "";

    if (total > 5000) {
        message =
            `HUrray !! It is Platinum Customer (${id}) : Please offer a 20% discount.
(Total Purchased value in last 1 year is ${total})`;
    }
    else if (total > 2000) {
        message =
            `HUrray !! It is Gold Customer (${id}) : Please offer a 10% discount.
(Total Purchased value in last 1 year is ${total})`;
    }
    else {
        message =
            `It is General Customer (${id}) : No discount.
(Total Purchased value in last 1 year is ${total})`;
    }

    req.info(message);
    return message;
});



    this.on('totalSales', async (req) => {
        const { year } = req.data;
        const tx = cds.tx(req);

        const { total } = await tx.run(
            SELECT.one.from('ds.salesapp.SalesOrder')
                .columns('sum(NetValue) as total')
                .where`OrderDate >= ${year + '-01-01'} and 
                        OrderDate <= ${year + '-12-31'}`);

        return total || 0;
    })
})
