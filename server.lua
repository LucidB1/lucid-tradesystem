ESX = nil
TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
local trades = {}





RegisterCommand('trade', function(source, args)
	local src = source
	local Player = ESX.GetPlayerFromId(source)
	local TargetId = tonumber(args[1])
	local Target = ESX.GetPlayerFromId(TargetId)
	
	local senderplayer = GetPlayerPed(source)
	local receiverPlayer = GetPlayerPed(TargetId)
	local sendercoords = GetEntityCoords(senderplayer)
	local receiverCoords = GetEntityCoords(receiverPlayer)
	local dist = #(sendercoords - receiverCoords)

	--local dist = #(vector3(sendercoords.x,sendercoords.y, sendercoords.z) - vector3(receiverCoords.x,receiverCoords.y , receiverCoords.z))


	
	if dist <= 3 then 

		if Target ~= nil then
			if TargetId ~= source then
				TriggerClientEvent('codem-trade:tradeRequested',  TargetId, source)
			else
				TriggerClientEvent('esx:showNotification', src, 'No player found')
			end
		else
			TriggerClientEvent('esx:showNotification', src, 'No player found')
		end
	else
		TriggerClientEvent('esx:showNotification', src, 'No player found')
	end

end)



RegisterServerEvent('codem-trade:tradeRequestAccepted')
AddEventHandler('codem-trade:tradeRequestAccepted', function(sender)
	local senderid = sender
	local receiverid = source
	
	local newsenderinventory = {}
	local newreceiverinventory = {}
	local sender_inventory = ESX.GetPlayerFromId(senderid).getInventory();
	local receiver_inventory = ESX.GetPlayerFromId(receiverid).getInventory();
	local receiver_name = GetPlayerName(receiverid)
	for k,v in pairs(sender_inventory) do 
		if v.count > 0 then table.insert(newsenderinventory, v) end 
	end
	for k,v in pairs(receiver_inventory) do 
		if v.count > 0 then table.insert(newreceiverinventory, v) end 
	end

	local sender_name = GetPlayerName(senderid)

	TriggerClientEvent('codem-trade:setTrade', senderid, senderid, receiverid, newsenderinventory, newreceiverinventory, sender_name, receiver_name)
	TriggerClientEvent('codem-trade:setTrade', receiverid, senderid,receiverid,  newsenderinventory, newreceiverinventory, sender_name, receiver_name)
    table.insert(trades, { sender_id =senderid, receiver_id = receiverid})

end)


RegisterServerEvent('codem-trade:server:itemSwapped')
AddEventHandler('codem-trade:server:itemSwapped', function(data)
	local sender_id = data.sender
	local receiver_id = data.receiver
	local toInv = data.toInventory
	local toSlot = data.toSlot
	local fromSlot = data.fromSlot
	local fromInv = data.fromInventory
	local count = data.count
	local senderPlayer = ESX.GetPlayerFromId(sender_id)
	local receiverPlayer = ESX.GetPlayerFromId(receiver_id)
	
	if(sender_id == source) then
		TriggerClientEvent('codem-trade:client:itemSwapped', receiver_id, { toInv = toInv, toSlot = toSlot, fromInv = fromInv, fromSlot = fromSlot, count = count })
	end

	if receiver_id == source then
		TriggerClientEvent('codem-trade:client:itemSwapped', sender_id, { toInv = toInv, toSlot = toSlot, fromInv = fromInv, fromSlot = fromSlot, count = count })
	end

end)

RegisterServerEvent('codem-trade:server:shareItems')
AddEventHandler('codem-trade:server:shareItems', function(data)
	local sender_id = data.sender
	local receiver_id = data.receiver
	local senderPlayer = ESX.GetPlayerFromId(sender_id)
	local receiverPlayer = ESX.GetPlayerFromId(receiver_id)
	local receiver_items = data.receiverOfferItems
	local sender_items = data.senderOfferItems


	if(source == sender_id) then


	
	
		for k,v in pairs(sender_items) do
			
			senderPlayer.removeInventoryItem(v.name, v.count)
			receiverPlayer.addInventoryItem(v.name, v.count)
		end

		for k,v in pairs(receiver_items) do
			senderPlayer.addInventoryItem(v.name, v.count)
			receiverPlayer.removeInventoryItem(v.name, v.count)
		end
	end
end)


RegisterServerEvent('codem-trade:server:confirmToggled')
AddEventHandler('codem-trade:server:confirmToggled', function(data)
	local sender_id = data.sender
	local receiver_id = data.receiver
	local toggled = data.toggle

	if(sender_id == source) then
		TriggerClientEvent('codem-trade:client:confirmedToggled', receiver_id, toggled)
	end

	if(receiver_id == source) then
		TriggerClientEvent('codem-trade:client:confirmedToggled', sender_id, toggled)
	end

end)


RegisterServerEvent('codem-trade:server:tradeCanceled')
AddEventHandler("codem-trade:server:tradeCanceled", function(data)
	local sender_id = data.sender
	local receiver_id = data.receiver

	if sender_id == source then 
		TriggerClientEvent('codem-trade:client:tradeCanceled', receiver_id)
	end
	if receiver_id == source then 
		TriggerClientEvent('codem-trade:client:tradeCanceled', sender_id)
	end
end)


