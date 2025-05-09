import * as signalR from '@microsoft/signalr';
import { toast } from 'react-toastify';
import authService from './authService';

let connection = null;

export const startConnection = (userId) => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection;
  }
  
  connection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5253/hubs/notification', {
      accessTokenFactory: () => authService.getToken()
    })
    .withAutomaticReconnect()
    .build();

  connection.on('ReceiveOrderProcessedNotification', (message) => {
    toast.success(message);
    console.log('Order processed notification received:', message);
  });

  connection.on('ReceiveBroadcastNotification', (message) => {
    toast.info(message);
    console.log('Broadcast notification received:', message);
  });

  connection.start()
    .then(() => {
      console.log('SignalR Connected');
      // Register the connection with userId
      if (userId) {
        connection.invoke('RegisterConnection', userId.toString())
          .then(() => console.log(`Connection registered for user ${userId}`))
          .catch(err => console.error('Error registering connection:', err));
      }
    })
    .catch(err => console.error('SignalR Connection Error: ', err));

  return connection;
};

export const stopConnection = () => {
  if (connection) {
    connection.stop()
      .then(() => console.log('SignalR Disconnected'))
      .catch(err => console.error('Error stopping connection:', err));
  }
};
