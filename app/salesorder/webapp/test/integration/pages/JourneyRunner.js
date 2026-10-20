sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"ds/sales/salesorder/test/integration/pages/CustomerSetList.gen",
	"ds/sales/salesorder/test/integration/pages/CustomerSetObjectPage.gen",
	"ds/sales/salesorder/test/integration/pages/OrderSetObjectPage.gen"
], function (JourneyRunner, CustomerSetListGenerated, CustomerSetObjectPageGenerated, OrderSetObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('ds/sales/salesorder') + '/test/flpSandbox.html#dssalessalesorder-tile',
        pages: {
			onTheCustomerSetListGenerated: CustomerSetListGenerated,
			onTheCustomerSetObjectPageGenerated: CustomerSetObjectPageGenerated,
			onTheOrderSetObjectPageGenerated: OrderSetObjectPageGenerated
        },
        async: true
    });

    return runner;
});

