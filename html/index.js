const APP = new Vue({
    el: '#app',
    data: {
        show: false,
        senderId: null,
        receiverId: null,
        source: null,
        senderConfirmed: false,
        receiverConfirmed: false,

        senderName: null,
        receiverName: null,

        sourceItems: [],
        receiverItems: [],
        offerSlots: 8,
    },

    watch: {
        // whenever question changes, this function will run
        senderConfirmed: function (newData, oldData) {
          this.completeTrade()
        },

        receiverConfirmed: function (newData, oldData) {
            this.completeTrade()
          },
      },
    methods: {
        cancelTrade(){
            
            $.post(
                "http://lucid-tradesystem/tradeCanceled",
                JSON.stringify({
                    receiver: this.receiverId,
                    sender: this.senderId

                })

            );
            $.post(
                "http://lucid-tradesystem/resetNui",
                JSON.stringify({

                })

            );
            this.resetTrade()
        },
        setTrade(data) {
            this.senderId = data.senderSource;
            this.receiverId = data.receiverSource;
            this.source = data.source
            this.sourceItems = data.senderinventory
            this.receiverItems = data.receiverinventory
            this.senderName = data.senderName
            this.receiverName = data.receiverName


            this.show = true
        },
        setConfirmed(toggle){
            if (this.source == this.senderId) {
                this.receiverConfirmed = toggle
            }

            if(this.source == this.receiverId){
                this.senderConfirmed = toggle
            }
        },


        completeTrade(){
            if(this.senderConfirmed && this.receiverConfirmed){
                let receiverOfferItems = [];
                let senderOfferItems = [];




                $.each($(`.offer-items.receiver .item-slot`), function (index, item) {
                    if ($(item).attr('data-item') != null) {

                        let itemSend = JSON.parse($(item).attr('data-item'))

                        if(!isObjectEmpty(itemSend)){

                            receiverOfferItems.push(itemSend)

                        }
                    }
                 
                })
                $.each($(`.offer-items.sender .item-slot`), function (index, item) {
                    if ($(item).attr('data-item') != null) {

                        let itemSend = JSON.parse($(item).attr('data-item'))

                        if(!isObjectEmpty(itemSend)){

                            senderOfferItems.push(itemSend)

                        }
         
                    }
                 
                })


                $.post(
                    "http://lucid-tradesystem/tradeConfirmed",
                    JSON.stringify({
                        receiver: this.receiverId,
                        sender: this.senderId,
                        receiverOfferItems,
                        senderOfferItems,

                    })
                );
                this.resetTrade()
            }
        },
        resetTrade() {

            this.show= false
            this.senderId= null
            this.receiverId= null
            this.source= null
            this.senderConfirmed= false
            this.receiverConfirmed= false
            this.senderName= null
            this.receiverName= null
            this.sourceItems= []
            this.receiverItems= []
            this.offerSlots= 8
        },

        
        confirmTrade() {
            if (this.source == this.senderId) {
                this.senderConfirmed = !this.senderConfirmed
                $.post(
                    "http://lucid-tradesystem/confirmToggled",
                    JSON.stringify({
                        receiver: this.receiverId,
                        sender: this.senderId,
                        toggle: this.senderConfirmed
                    })
                );

            } else if (this.source == this.receiverId) {
                this.receiverConfirmed = !this.receiverConfirmed


                $.post(
                    "http://lucid-tradesystem/confirmToggled",
                    JSON.stringify({
                        receiver: this.receiverId,
                        sender: this.senderId,
                        toggle: this.receiverConfirmed

                    })
                );
            }
        },
        swap(fromInventory, toInventory, toSlot, fromSlot, newAmount) {
            let fromInv = $(`div[data-inventory='${fromInventory}']`)
            let toInv = $(`div[data-inventory='${toInventory}']`)
            let count = $('.amount').val()
            let fromitemData = fromInv.find(`.item-slot[data-slot=${fromSlot}]`).attr('data-item')
            let toitemData = toInv.find(`.item-slot[data-slot=${toSlot}]`).attr('data-item')

            let fromItemhtml = ``;
            let toItemhtml = ``

            let newDataFromInv = {};
            let newDataToInv = {}
            count = Number(count)
            if (fromitemData != null) {
                fromitemData = JSON.parse(fromitemData)

            }

            if (toitemData != null) {
                toitemData = JSON.parse(toitemData)

            }
            if (count == 0 || count == null || isNaN(count)) {
                count = fromitemData.count;
            }

            if (newAmount) {
                count = newAmount
            }

            if (fromitemData != null) {
                if (!isObjectEmpty(fromitemData)) {

                    if (fromitemData.count > count) {
                        newDataFromInv = { ...fromitemData }
                        newDataToInv = { ...fromitemData }
                        newDataFromInv.count -= count;
                        newDataToInv.count = count;
                        let newSlot = getFirstSlotByItem(fromitemData.name, toInventory)
                        if (newSlot) {
                            toSlot = newSlot
                            toitemData = JSON.parse(toInv.find(`.item-slot[data-slot=${toSlot}]`).attr('data-item'))
                            newDataToInv = { ...toitemData }
                            Number(newDataToInv.count)
                            newDataToInv.count = newDataToInv.count + count;
                        }

                        fromItemhtml = `
                            <div class="item-img">
                                <img src="./images/${newDataFromInv.name}.png">
                            </div>
                            <div class="item-infos">
                                <div class="item-label">${newDataFromInv.label}</div>
                                <div class="item-amount">${newDataFromInv.count}</div>
    
                            </div>
                        
                        `
                        toItemhtml = `
                            <div class="item-img">
                                <img src="./images/${newDataToInv.name}.png">
                            </div>
                            <div class="item-infos">
                                <div class="item-label">${newDataToInv.label}</div>
                                <div class="item-amount">${newDataToInv.count}</div>
    
                            </div>
    
                        
                        `

                    } else if (fromitemData.count == count) {
                        let newSlot = getFirstSlotByItem(fromitemData.name, toInventory)
                        if (newSlot) {
                            toSlot = newSlot
                            toitemData = JSON.parse(toInv.find(`.item-slot[data-slot=${toSlot}]`).attr('data-item'))
                        }

                        if (isObjectEmpty(toitemData)) {
                            newDataToInv = { ...fromitemData }

                        } else {

                            newDataToInv = { ...toitemData }
                        }

                        if (newSlot) {

                            newDataToInv.count += count;
                        }
                        toItemhtml = `
                            <div class="item-img">
                                <img src="./images/${newDataToInv.name}.png">
                            </div>
                            <div class="item-infos">
                                <div class="item-label">${newDataToInv.label}</div>
                                <div class="item-amount">${newDataToInv.count}</div>
    
                            </div>
                        `
                    }
                    if (fromitemData.count > count || fromitemData.count == count) {

                        fromInv.find(`.item-slot[data-slot=${fromSlot}]`).attr('data-item', JSON.stringify(newDataFromInv))
                        toInv.find(`.item-slot[data-slot=${toSlot}]`).attr('data-item', JSON.stringify(newDataToInv))

                        fromInv.find(`.item-slot[data-slot=${fromSlot}]`).html(fromItemhtml)
                        toInv.find(`.item-slot[data-slot=${toSlot}]`).html(toItemhtml)
                        $.post(
                            "http://lucid-tradesystem/ItemSwapped",
                            JSON.stringify({
                                receiver: this.receiverId,
                                sender: this.senderId,
                                toSlot,
                                toInventory,
                                fromInventory,
                                fromSlot,
                                count,
                            })
                        );

                    }
                }
            }
        },
        swapOtherPlayerChanged(fromInventory, toInventory, toSlot, fromSlot, newAmount) {
            let fromInv = $(`div[data-inventory='${fromInventory}']`)
            let toInv = $(`div[data-inventory='${toInventory}']`)
            let count = $('.amount').val()
            let fromitemData = fromInv.find(`.item-slot[data-slot=${fromSlot}]`).attr('data-item')
            let toitemData = toInv.find(`.item-slot[data-slot=${toSlot}]`).attr('data-item')

            let fromItemhtml = ``;
            let toItemhtml = ``

            let newDataFromInv = {};
            let newDataToInv = {}
            count = Number(count)
            if (fromitemData != null) {
                fromitemData = JSON.parse(fromitemData)

            }

            if (toitemData != null) {
                toitemData = JSON.parse(toitemData)

            }
            if (count == 0 || count == null || isNaN(count)) {
                count = fromitemData.count;
            }

            if (newAmount) {
                count = newAmount
            }

            if (fromitemData != null) {
                if (!isObjectEmpty(fromitemData)) {

                    if (fromitemData.count > count) {
                        newDataFromInv = { ...fromitemData }
                        newDataToInv = { ...fromitemData }
                        newDataFromInv.count -= count;
                        newDataToInv.count = count;
                        let newSlot = getFirstSlotByItem(fromitemData.name, toInventory)
                        if (newSlot) {
                            toSlot = newSlot
                            toitemData = JSON.parse(toInv.find(`.item-slot[data-slot=${toSlot}]`).attr('data-item'))
                            newDataToInv = { ...toitemData }
                            Number(newDataToInv.count)
                            newDataToInv.count = newDataToInv.count + count;
                        }

                        fromItemhtml = `
                            <div class="item-img">
                                <img src="./images/${newDataFromInv.name}.png">
                            </div>
                            <div class="item-infos">
                                <div class="item-label">${newDataFromInv.label}</div>
                                <div class="item-amount">${newDataFromInv.count}</div>
    
                            </div>
                        
                        `
                        toItemhtml = `
                            <div class="item-img">
                                <img src="./images/${newDataToInv.name}.png">
                            </div>
                            <div class="item-infos">
                                <div class="item-label">${newDataToInv.label}</div>
                                <div class="item-amount">${newDataToInv.count}</div>
    
                            </div>
    
                        
                        `

                    } else if (fromitemData.count == count) {
                        let newSlot = getFirstSlotByItem(fromitemData.name, toInventory)
                        if (newSlot) {
                            toSlot = newSlot
                            toitemData = JSON.parse(toInv.find(`.item-slot[data-slot=${toSlot}]`).attr('data-item'))
                        }

                        if (isObjectEmpty(toitemData)) {
                            newDataToInv = { ...fromitemData }

                        } else {

                            newDataToInv = { ...toitemData }
                        }

                        if (newSlot) {

                            newDataToInv.count += count;
                        }
                        toItemhtml = `
                            <div class="item-img">
                                <img src="./images/${newDataToInv.name}.png">
                            </div>
                            <div class="item-infos">
                                <div class="item-label">${newDataToInv.label}</div>
                                <div class="item-amount">${newDataToInv.count}</div>
    
                            </div>
                        `
                    }
                    if (fromitemData.count > count || fromitemData.count == count) {

                        fromInv.find(`.item-slot[data-slot=${fromSlot}]`).attr('data-item', JSON.stringify(newDataFromInv))
                        toInv.find(`.item-slot[data-slot=${toSlot}]`).attr('data-item', JSON.stringify(newDataToInv))

                        fromInv.find(`.item-slot[data-slot=${fromSlot}]`).html(fromItemhtml)
                        toInv.find(`.item-slot[data-slot=${toSlot}]`).html(toItemhtml)

                    }
                }
            }
        },
    },
    computed: {
        combineSenderItems() {

            var output = this.sourceItems.reduce(function (accumulator, cur) {
                if (cur != null) {
                    var name = cur.name, found = accumulator.find(function (elem) {
                        return elem.name == name
                    });
                    if (found) found.count += cur.count;
                    else accumulator.push(cur);

                }
                return accumulator;
            }, []);

            return output
        },

        combineReceiverItems() {
            var output = this.receiverItems.reduce(function (accumulator, cur) {
                if (cur != null) {
                    var name = cur.name, found = accumulator.find(function (elem) {
                        return elem.name == name
                    });
                    if (found) found.count += cur.count;
                    else accumulator.push(cur);

                }
                return accumulator;
            }, []);

            return output
        },

    },
})



function getFirstSlotByItem(itemname, inventory) {
    let inv = $(`div[data-inventory='${inventory}']`)
    let found = false
    let slot = null;


    $.each(inv.find(`.item-slot`), function (index, item) {
        if ($(item).attr('data-item') != null) {

            if (!isObjectEmpty(JSON.parse($(item).attr('data-item'))) && !found) {

                if (JSON.parse($(item).attr('data-item')).name == itemname) {
                    slot = index
                    found = true
                }
            }

        }

    })
    return slot != null ? slot + 1 : null;
}

function isObjectEmpty(empty) {
    if (empty != null) {
        return Object.keys(empty).length === 0 && empty.constructor === Object



    } else {
        return true
    }
}

$(document).on("contextmenu", ".item-slot.sender", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (APP.$data.source == APP.$data.senderId) {
        let fromInventory = $(this).parent().data('inventory')

        let toInventory = fromInventory == 'sender-offer' ? 'sender-items' : 'sender-offer';
        let toSlot = getFirstAvaliableSlot(toInventory)
        let fromSlot = $(this).data('slot')
        APP.swap(fromInventory, toInventory, toSlot, fromSlot)
    }

});


$(document).on("contextmenu", ".item-slot.receiver", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (APP.$data.source == APP.$data.receiverId) {
        let fromInventory = $(this).parent().data('inventory')
        let toInventory = fromInventory == 'receiver-offer' ? 'receiver-items' : 'receiver-offer';
        let toSlot = getFirstAvaliableSlot(toInventory)
        let fromSlot = $(this).data('slot')
        APP.swap(fromInventory, toInventory, toSlot, fromSlot)
    }

});



function getFirstAvaliableSlot(inventory) {
    let inv = $(`div[data-inventory='${inventory}']`)
    let slot = 1;
    let found = false
    $.each(inv.find(`.item-slot`), function (index, item) {


        if ($(item).attr('data-item') != null) {
            if (isObjectEmpty(JSON.parse($(item).attr('data-item'))) && !found) {
                slot = index
                found = true
            }
        } else {
            if (!found) {
                slot = index
                found = true
            }
        }


    })
    return slot + 1;


}

window.addEventListener("message", function (event) {
    switch (event.data.action) {
        case "setTrade":
            APP.setTrade(event.data);
            break;
        case "swapItems":
            console.log('swapping items')
            APP.swapOtherPlayerChanged(event.data.slots.fromInv, event.data.slots.toInv, event.data.slots.toSlot, event.data.slots.fromSlot, event.data.slots.count)
            break;

        case "setConfirmed":
            APP.setConfirmed(event.data.toggle)
            break;
        case "close":
            APP.resetTrade()

            break;
            default:
            break;
        

    }
});




