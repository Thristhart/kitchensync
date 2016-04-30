require('./lobbyList.tag');
require('./sync.tag');
<kitchen>
  <a href="#/">Kitchen Sync</a>
  <lobbyList if={view === 'list'} socket={socket}/>
  <sync if={view === 'sync'} socket={socket} lobby_id={lobbyId}/>
  <yield />
  <script>
    /* global riot */
    const socketIO = require('socket.io-client');
    
    this.socket = socketIO('https://kitchensync-thristhart.c9users.io:8080/');
    window.socket = this.socket;
    
    this.socket.on('connect', () => {
      console.log("connect");
      this.update();
    });
    
    riot.route('/', () => {
      console.log("list view")
      this.setView('list');
    });
    riot.route('/sync/', () => riot.route('/'));
    riot.route('/sync/*', lobbyId => {
      this.lobbyId = lobbyId;
      this.setView('sync');
    });
    
    this.setView = function(newView) {
      if(newView !== this.view) {
        this.view = newView;
        this.update();
      }
    }
  </script>
</kitchen>