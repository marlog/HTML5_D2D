
if (!navigator.getExternalStorages) {

    var socket = null;
    
    function extStorage(type, id, name, sys) {
        this.type = type;
        this.id = id;
        this.name = name;
        this.online = true;
        this.loading = false;
        this.empty = true;
        this.configurable =true;
        this.enumerable = true;
        this.writable = true;
        this.$system = sys;
        this.set = function(key_value, value) {
            this.$system.emit('message',{device:this.id, key:key_value, data:value});
        }
        this.onnotify = function(cb) {
            document.removeEventListener('notify');
            document.addEventListener('notify',cb);
        }
        document.addEventListener('notify',function(e){console.info(e)});
    }
    
    function externalStorageList(data, sys) {
        var _self = this;
        this.$extlist = {};
        this.$system = sys;
        data.forEach(function(e){
//            _self.$extlist[e.id]=new extStorage(e.type, e.id, e.name, sys);
            _self.$extlist[e.id] = _self[e.id]=new extStorage(e.type, e.id, e.name, sys);
        });
        this.getStorageById = function(id) {
            //return _self.$extlist[id];
            return _self[id];
        };
        this.getStorageList = function() {
            return _self.$extlist;
        }
        this.$system.on('offline', function(data){
            console.log('offline',data);
        });
        this.$system.on('get', function(data) {
            console.log(data)
            document.dispatchEvent(new CustomEvent('notify',{detail:data}))
        });
        
    }

    Object.defineProperty(
        navigator, 
        "getExternalStorages", 
        {
            value: function(type, successCallback, errorCallback) {
                if (socket === null) {
                    socket = io.connect(location.href);
                    socket.on('connect', function(client){
                            console.log('connect');
                    });
                    socket.on('init_storages', function (data) {
                            console.log(data);
                            if (socket.successCallback_init != null)
                                socket.successCallback_init(new externalStorageList(data.devices, socket));
                     });
                     socket.on('disconnect', function(){
                            console.log('disconnect');
                    }); 
                }
    
                socket.successCallback_init = successCallback;
                socket.emit('get_storages',{type:type});
            }
        }
    );

}






