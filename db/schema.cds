using { managed, Currency } from '@sap/cds/common';

namespace ds.salesapp;

entity Customer : managed {
   key Cust_id : String(10);
   CustomerName : String(20);
   Address      : String(50);
   City         : String(10);
   Country      : String(20);
   Email        : String(30);
   PhoneNumber  : String(20);
   orders       : Association to many SalesOrder
                  on orders.customer = $self;
}

entity SalesOrder : managed  {
    key Order_Id : String(10);
        OrderDate : Date;
        customer : Association to Customer;
        Status   : String(10);
        NetValue : Decimal(10, 2);
        Currency : Currency;
        Items    : Composition of many SalesOrderItem
                    on Items.Parent = $self;
}

entity SalesOrderItem {
    key Item_Id : Integer;
    key Parent  : Association to SalesOrder;
        ProductCode : String(20);
        ProductDesc : String(50);
        Quantity    : Integer;
        UOM         : String(3);
        NetPrice    : Decimal(10, 2);
        Currency    : Currency;
}

