sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/DatePicker",
    "sap/m/VBox"
], function (
    MessageBox,
    Dialog,
    Button,
    Input,
    Label,
    DatePicker,
    VBox
) {
    "use strict";

    return {

        totalSales: async function (...args) {

            const yearInput = new Input({
                type: "Number",
                placeholder: "e.g. 2026"
            });

            const dialog = new Dialog({
                title: "Total Sales",
                contentWidth: "450px",

                content: [
                    new VBox({
                        items: [
                            new Label({
                                text: "Enter Year"
                            }),
                            yearInput
                        ]
                    }).addStyleClass("sapUiMediumMargin")
                ],

                beginButton: new Button({
                    text: "Execute",

                    press: async function () {

                        try {

                            const year = Number(
                                yearInput.getValue()
                            );

                            if (!year) {

                                MessageBox.error(
                                    "Please enter a valid year"
                                );

                                return;
                            }

                            const oModel =
                                args[2].oModel;

                            const oOperation =
                                oModel.bindContext(
                                    "/totalSales(...)"
                                );

                            oOperation.setParameter(
                                "year",
                                year
                            );

                            await oOperation.execute();

                            const result =
                                oOperation
                                    .getBoundContext()
                                    .getObject();

                            console.log(
                                "Total Sales Result",
                                result
                            );

                            MessageBox.information(
                               `Total Sales : ${result.value}`
                            );

                            dialog.close();

                        } catch (err) {

                            console.error(err);

                            MessageBox.error(
                                err.message
                            );
                        }
                    }
                }),

                endButton: new Button({
                    text: "Cancel",
                    press: function () {
                        dialog.close();
                    }
                })
            });

            dialog.open();
        },



        cancelOpenOrders: async function (...args) {

            const datePicker =
                new DatePicker({
                    width: "100%"
                });

            const dialog =
                new Dialog({

                    title: "Cancel Open Orders",

                    contentWidth: "450px",

                    content: [
                        new VBox({
                            items: [
                                new Label({
                                    text: "Select Date"
                                }),
                                datePicker
                            ]
                        }).addStyleClass("sapUiMediumMargin")
                    ],

                    beginButton: new Button({

                        text: "Execute",

                        press: async function () {

                            try {

                                const selectedDate =
                                    datePicker.getDateValue();

                                if (!selectedDate) {

                                    MessageBox.error(
                                        "Please select a date"
                                    );

                                    return;
                                }

                                const day =
                                    selectedDate.getDate();

                                const month =
                                    selectedDate.getMonth() + 1;

                                const year =
                                    selectedDate.getFullYear();

                                const oModel =
                                    args[2].oModel;

                                const oOperation =
                                    oModel.bindContext(
                                        "/cancelOpenOrderForDate(...)"
                                    );

                                oOperation.setParameter(
                                    "day",
                                    day
                                );

                                oOperation.setParameter(
                                    "month",
                                    month
                                );

                                oOperation.setParameter(
                                    "year",
                                    year
                                );

                                await oOperation.execute();

                                const result =
                                    oOperation
                                        .getBoundContext()
                                        .getObject();

                                console.log(
                                    "Cancel Result",
                                    result
                                );

                                MessageBox.information(
                                      result.value
                                );

                                dialog.close();

                            } catch (err) {

                                console.error(err);

                                MessageBox.error(
                                    err.message
                                );
                            }
                        }
                    }),

                    endButton: new Button({

                        text: "Cancel",

                        press: function () {
                            dialog.close();
                        }
                    })
                });

            dialog.open();
        }
    };
});