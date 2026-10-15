using ds.salesapp as db from '../db/schema';

service CatalogService @(path: 'CatalogService'){

    entity CustomerSet as projection on db.Customer
    actions{function customerLoyaltyLevel() returns String};
    
    entity OrderSet as projection on db.SalesOrder
    actions{action markOrderAsPaid() returns OrderSet};
    

    entity ItemSet as projection on db.SalesOrderItem;

    action cancelOpenOrderForDate(day: Integer, month: Integer, year: Integer) returns String;

    function totalSales(year:Integer) returns Decimal;
}



