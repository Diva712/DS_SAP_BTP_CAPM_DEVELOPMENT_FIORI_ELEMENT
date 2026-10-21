using CatalogService as service from '../../srv/service';

annotate service.CustomerSet with {
    Cust_id      @Common.Label: 'Customer ID';
    CustomerName @Common.Label: 'Customer Name';
    City         @Common.Label: 'City';
    Country      @Common.Label: 'Country';
    Email        @Common.Label: 'Email';
    PhoneNumber  @Common.Label: 'Phone';
    Address @Common.Label: 'Address';
    modifiedAt   @Common.Label: 'Changed At';
    modifiedBy   @Common.Label: 'Changed By';
    createdAt    @Common.Label: 'Created At';
    createdBy    @Common.Label: 'Created By'
};

annotate service.OrderSet with {
    Order_Id      @Common.Label: 'Order ID';
    Currency_code @Common.Label: 'Currency';
    NetValue      @Common.Label: 'Total Amount';
    OrderDate     @Common.Label: 'Order Date';
    Status        @Common.Label: 'Status';
    modifiedAt    @Common.Label: 'Changed At';
    modifiedBy    @Common.Label: 'Changed By';
    createdAt     @Common.Label: 'Created At';
    createdBy     @Common.Label: 'Created By'
};

annotate service.ItemSet with {
    Item_Id     @Common.Label: 'Item ID';
    ProductCode @Common.Label: 'Product Code';
    ProductDesc @Common.Label: 'Product Description';
    Quantity    @Common.Label: 'Quantity';
    UOM         @Common.Label: 'UOM';
    NetPrice    @Common.Label: 'Net Price';
    Currency    @Common.Label: 'Currency'
};

annotate service.CustomerSet with @(
    UI.SelectionFields        : [
        Cust_id,
        CustomerName,
        City
    ],

    UI.LineItem               : [
        {Value: Cust_id},
        {Value: CustomerName},
        {Value: City},
        {Value: Country},
        {Value: PhoneNumber},
        {Value: Email}
    ],

    UI.HeaderInfo             : {
        TypeName      : 'Customer',
        TypeNamePlural: 'Customers',
        Title         : {Value: CustomerName},
        Description   : {Value: Cust_id}
    },

    UI.Facets                 : [
        {
            $Type : 'UI.CollectionFacet',
            Label : 'Customer Info',
            Facets: [
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'General Info',
                    Target: '@UI.FieldGroup#GeneralInfo'
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'Admin Info',
                    Target: '@UI.FieldGroup#AdminInfo'
                }
            ]
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Sales Orders',
            Target: 'orders/@UI.LineItem'
        }
    ],

    UI.FieldGroup #GeneralInfo: {Data: [
        {Value: CustomerName},
        {Value: Address},
        {Value: City},
        {Value: Email},
        {Value: PhoneNumber},
        {Value: Address},
        {Value: Country}
    ]},

    UI.FieldGroup #AdminInfo  : {Data: [
        {Value: createdBy},
        {Value: createdAt},
        {Value: modifiedBy},
        {Value: modifiedAt}
    ]}
);


annotate service.OrderSet with @(
    UI.LineItem               : [
        {Value: Order_Id},
        {Value: OrderDate, },
        {Value: NetValue},
        {Value: Currency_code},
        {Value: Status}
    ],
    UI.HeaderInfo             : {
        TypeName      : 'Sales Order',
        TypeNamePlural: 'Sales Orders',
        Title         : {Value: Order_Id},
        Description   : {Value: Status}
    },


    UI.Facets                 : [
        {
            $Type : 'UI.CollectionFacet',
            Label : 'Sales Order Info',
            Facets: [
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'General Info',
                    Target: '@UI.FieldGroup#OrderGeneralInfo'
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'Admin Info',
                    Target: '@UI.FieldGroup#OrderAdminInfo'
                }
            ]
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Sales Order Items',
            Target: 'Items/@UI.LineItem'
        }
    ],

    UI.FieldGroup #OrderGeneralInfo: {Data: [
        {Value: Order_Id},
        {Value: OrderDate},
        {Value: NetValue},
        {Value: Currency_code}
    ]},

    UI.FieldGroup #OrderAdminInfo  : {Data: [
        {Value: createdBy},
        {Value: createdAt},
        {Value: modifiedBy},
        {Value: modifiedAt}
    ]}

);


annotate service.ItemSet with @(UI.LineItem: [
    {Value: Item_Id},
    {Value: ProductCode, },
    {Value: ProductDesc},
    {Value: Quantity},
    {Value: UOM},
    {Value: NetPrice},
    {Value: Currency_code}
], )
