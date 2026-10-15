using ds.salesapp as db from '../db/schema';

service CatalogService @(
    path    : 'CatalogService',
    requires: 'authenticated-user'
) {

    entity CustomerSet @(restrict: [
        {
            grant: [
                Read,
                Write
            ],
            to   : 'Editor'
        },
        {
            grant: [Read],
            to   : 'Viewer',
            where: 'Country = $user.Country'
        }
    ]) as projection on db.Customer
        actions {

            @restrict: [{to: [
                'Editor',
                'Viewer'
            ]}]
            function customerLoyaltyLevel() returns String
        };

    entity OrderSet @(restrict: [
        {
            grant: [
                Read,
                Write
            ],
            to   : 'Editor'
        },
        {
            grant: [Read],
            to   : 'Viewer',
            where: 'Status = ''Open'''
        },
        {
            grant: [Create],
            to   : 'Viewer'

        }
    ]) as projection on db.SalesOrder
        actions {
            @restrict: [{to: [
                'Editor',
                'Viewer'
            ]}]
            action markOrderAsPaid() returns OrderSet
        };


    entity ItemSet @(restrict: [
        {
            grant: [
                Read,
                Write
            ],
            to   : 'Editor'
        },
        {
            grant: [
                Read,
                Create
            ],
            to   : 'Viewer'
        }
    ]) as projection on db.SalesOrderItem;

    action   cancelOpenOrderForDate(day: Integer, month: Integer, year: Integer) returns String;

    @requires: 'Editor'
    function totalSales(year: Integer)                                           returns Decimal;
}
