require('./faucets/youtube.tag');
<faucet>
     <div></div>
     <script>
          this.render = function() {
               if(this.opts.tag && this.opts.data) {
                    if(this.player) {
                         this.player.unmount();
                    }
                    var tagEl = document.createElement(opts.tag);
                    this.root.appendChild(tagEl);
                    this.player = riot.mount(tagEl, this.opts.tag, this.opts.data)[0];
                    return this.player;
               }
          };
     </script>
</faucet>