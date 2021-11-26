ESX = nil

Citizen.CreateThread(function()
    while ESX == nil do
        TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
        Citizen.Wait(0)
    end
end)


local active = false
local accepted = false

RegisterNetEvent('codem-trade:tradeRequested')
AddEventHandler('codem-trade:tradeRequested', function(sender)
    
    active = true

    ESX.ShowNotification('You have receive new trade request press E to accept')
    while active do
        Citizen.Wait(0)
        if IsControlJustPressed(0, 38) then
            active = false
            accepted = true
            TriggerServerEvent('codem-trade:tradeRequestAccepted', sender)
        end
    end

end)

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if active then
            Citizen.Wait(10000)
            active = false
            if not accepted then
            ESX.ShowNotification("Trade request expired")
            end
            accepted = false
        end
    end
end)


RegisterNetEvent('codem-trade:setTrade')
AddEventHandler('codem-trade:setTrade', function(senderSource, receiverSource, senderinv, receiverinv, senderName, receiverName)
    SendNUIMessage({
        action = 'setTrade',
        senderSource = senderSource,
        source = GetPlayerServerId(PlayerId()),
        receiverSource = receiverSource,
        senderinventory = senderinv,
        receiverinventory = receiverinv,
        senderName = senderName,
        receiverName = receiverName,

    })
    SetNuiFocus(true, true)
end)


RegisterNUICallback('ItemSwapped', function(data, cb)
    TriggerServerEvent("codem-trade:server:itemSwapped", data)
end)


RegisterNUICallback('tradeCanceled', function(data, cb)
    TriggerServerEvent("codem-trade:server:tradeCanceled", data)

end)

RegisterNetEvent('codem-trade:client:tradeCanceled')
AddEventHandler('codem-trade:client:tradeCanceled', function()


    SendNUIMessage({
        action = 'close'
    })
    SetNuiFocus(false, false)

end)


RegisterNUICallback('resetNui', function(data)
    SetNuiFocus(false,false)
end)
RegisterNUICallback('confirmToggled', function(data, cb)
    TriggerServerEvent("codem-trade:server:confirmToggled", data)
end)

RegisterNUICallback('tradeConfirmed', function(data, cb)
    TriggerServerEvent("codem-trade:server:shareItems", data)
    SetNuiFocus(false, false)
end)


RegisterNetEvent('codem-trade:client:confirmedToggled')
AddEventHandler('codem-trade:client:confirmedToggled', function(toggle)
    SendNUIMessage({
        action = 'setConfirmed',
        toggle = toggle,
    })
end)




RegisterNetEvent('codem-trade:client:itemSwapped')
AddEventHandler('codem-trade:client:itemSwapped', function(data)
    SendNUIMessage({
        action = 'swapItems',
        slots = data,

    })

end)