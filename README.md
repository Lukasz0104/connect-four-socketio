# connect-four-socketio
Simple *Connect Four* game in TypeScript with use of [Socket.IO](https://socket.io/).

### instructions:
1. clone this repo
2. run `npm i` to install required packages
3. run the server by running either:  
	3.1 `npm run devServer` to start development server (automatic reload)  
	3.2 `npm run build` followed by `npm start`
4. open 2 instances of `localhost:3000` in a browser (e.g. in separate tabs)[^1] or visit `<server's ip address>:3000` on other devices in local network

[^1]: Restarting the game may not work when opened in two separate tabs.

### todos:
- [x] create rooms on the server
- [x] enable players to join room by clicking on room's id
- [ ] improve styling
- [x] migrate to TypeScript
