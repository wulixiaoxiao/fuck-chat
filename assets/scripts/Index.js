cc.Class({
    extends: cc.Component,

    properties: {
	 	house1Node: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Node, // optional, default is typeof default
        },
        headdivNode: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Node, // optional, default is typeof default
        },
        headPre: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Prefab, // optional, default is typeof default
        },
        
        selectHeadNode: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Node, // optional, default is typeof default
        },

        nickNode: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Node, // optional, default is typeof default
        },

        regbtnNode: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Node, // optional, default is typeof default
        },
        regbanNode: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Node, // optional, default is typeof default
        },

    },

    ws() {
        var ws = new WebSocket(this.address);
        this.ws = ws;
        this.ws.onopen = function()
        {
           // Web Socket 已连接上，使用 send() 方法发送注册数据
           cc.log("数据发送中...");
        };
        this.ws.onmessage = function (evt)
        {
           cc.log("数据已接收...");


        };
         
        this.ws.onclose = function()
        { 
           // 关闭 websocket
           cc.log("连接已关闭..."); 
           
        };
        this.ws.onerror = function()
        { 
           // 关闭 websocket
           cc.log("连接已异常关闭..."); 
                
        };

        

    },

  
    reg() {
        var username = this.nickNode.getComponent(cc.EditBox).string;
        var head = cc.sys.localStorage.getItem("select_head");
        if(head == '' || username == '') {
            return false;
        }
        
        var data = {"method": 'reg', "user": username, "head": head};
        this.ws.send(JSON.stringify(data));

        // 存储信息
        cc.sys.localStorage.setItem("select_head", head);
        cc.sys.localStorage.setItem("user", username);
        this.regbanNode.active = false;

    },

    onLoad () {
        this.address = "ws://47.93.234.1:88";
        // this.address = "ws://127.0.0.1:9501";
        // 连接服务器
        this.ws();

        var head = cc.sys.localStorage.getItem("select_head");
        var user = cc.sys.localStorage.getItem("user");
        if(head != '' && user != '' && user != undefined) {
            this.regbanNode.active = false;
        }

        this.callback = function () {
            cc.log("连接状态"+this.ws.readyState);
            if(this.ws.readyState == 1) {
                this.unschedule(this.callback);
                this.init();
            }
        }
        this.schedule(this.callback, 1);
    },

    init() {
        this.count = 0;
        this.oldHead = 'head1';
        cc.sys.localStorage.setItem("select_head", 'head1');
        this.house1Node.on(cc.Node.EventType.MOUSE_DOWN, this.intoHouse, this);	
        
        var head = cc.sys.localStorage.getItem("select_head");
        var user = cc.sys.localStorage.getItem("user");
        if(head != '' && user != '' && user != undefined) {
            this.regbanNode.active = false;
            var data = {"method": 'reg', "user": user, "head": head};
            this.ws.send(JSON.stringify(data));
        }
        
        var self = this;
        cc.loader.loadResDir("headimg", cc.SpriteFrame, function (err, assets, urls) {
            assets.forEach(element => {
                var headNode = cc.instantiate(self.headPre);
                headNode.parent = self.headdivNode;
                headNode.name = element.name;
                headNode.getComponent(cc.Sprite).spriteFrame = element;
            });
        });

        this.regbtnNode.on(cc.Node.EventType.MOUSE_DOWN, this.reg, this);
    },

    intoHouse() {
        this.ws.close();
    	cc.director.loadScene("house");
    },

    startScene(event) {
   		

    },




    // start () {},

    update (dt) {

        this.count += 1;
        if(this.count > 30) {
            this.count = 0;
            // 检查头像选中
            var oldhead = cc.sys.localStorage.getItem("select_head");
            if(oldhead != this.oldHead && oldhead != '') {
                var self = this;
                this.oldHead = oldhead;
                cc.loader.loadRes("headimg/"+oldhead, cc.SpriteFrame, function (err, spriteFrame) {
                    self.selectHeadNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            }


        }

    },
});
