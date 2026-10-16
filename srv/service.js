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
    this.after('READ', 'ItemSet', (items) => {
        for (const item of items) {
            item.Total_Price = `${item.Quantity * item.NetPrice} ${item.Currency_code}`;
        }
    });

    this.on('markOrderAsPaid', 'OrderSet', async (req) => {
        const id = req.params[0].Order_Id;
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
       return { message: `${updatedOrders} orders are cancelled for ${day}-${month}-${year}`}; 
    });

    this.on('customerLoyaltyLevel','CustomerSet', async (req) => {
        const id = req.params[0].Cust_id;
        const tx = cds.tx(req);

        const today = new Date();
        const oneYearAgo = new Date(today.setFullYear(today.getFullYear()-1));

        const {Total} = await tx.run(
            SELECT.one.from('ds.salesapp.SalesOrder')
                .columns('sum(NetValue) as Total')
                .where({customer_Cust_id: id, OrderDate:{ '>=': oneYearAgo.toISOString()}})
        );

        if ( Total > 50000) {
            return `HUrray !! It is Platnium CUstomer : PLease offer a 20% discount : 
                        (Total Purchased value in last 1 year is ${Total})`;
        }
        else if ( Total > 20000) {
            return `HUrray !! It is GOld CUstomer : PLease offer a 10% discount : 
                        (Total Purchased value in last 1 year is ${Total})`;
        }
        else {
            return ` It is General CUstomer : No discount : 
                        (Total Purchased value in last 1 year is ${Total})`;
        }
    });

    this.on('totalSales', async (req) => {
        const {year} = req.data;
        const tx = cds.tx(req);

        const {total} = await tx.run(
            SELECT.one.from('ds.salesapp.SalesOrder')
                .columns('sum(NetValue) as total')
                .where `OrderDate >= ${year + '-01-01'} and 
                        OrderDate <= ${year + '-12-31'}` );

        return   total || 0;
    })
})
