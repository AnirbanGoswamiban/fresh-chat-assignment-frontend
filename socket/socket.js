import { io } from 'socket.io-client';
const clientSocket = io(`${process.env.NEXT_PUBLIC_SOCKET_PORT}`)
export default  clientSocket

