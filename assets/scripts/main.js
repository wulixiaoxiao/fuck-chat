cc.Class({
    extends: cc.Component,

    properties: {
        chatNodePre: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Prefab, // optional, default is typeof default
        },
        chatContentNode: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Node, // optional, default is typeof default
        },
        shurukuangNode: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Node, // optional, default is typeof default
        },
      	scrollviewNode: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Node, // optional, default is typeof default
        },

        noticeNode: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Node, // optional, default is typeof default
        },



        sendbtnNode: cc.Button
       
    },

    // LIFE-CYCLE CALLBACKS:
    sendmsg() {
    	// 发送ws信息
        var msgContent = this.shurukuangNode.getComponent(cc.EditBox).string;
        
        
        var msgData = {"user":this.user, "msg":msgContent};

		var is_succ = this.ws.send(JSON.stringify(msgData));
	 	// 初始化一个聊天框		

        var node = cc.instantiate(this.chatNodePre);
        var head = cc.sys.localStorage.getItem("select_head");
        cc.loader.loadRes("headimg/"+head, cc.SpriteFrame, function (err, spriteFrame) {
            node.getChildByName('head').getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
		node.getChildByName('msg').getComponent(cc.Label).string = "我说："+msgContent;
	    node.parent = this.chatContentNode;
	    this.scrollviewNode.getComponent(cc.ScrollView).scrollToBottom(0.1)
        // 清空消息框
        this.shurukuangNode.getComponent(cc.EditBox).string = '';
        this.shurukuangNode.getChildByName('New Label').getComponent(cc.Label).string = '';
        this.shurukuangNode.getComponent(cc.EditBox).focus();
    },

    ws() {
        var ws = new WebSocket(this.address);
        this.ws = ws;
        this.ws.onopen = function()
        {
           // Web Socket 已连接上，使用 send() 方法发送注册数据
           cc.log("数据发送中...");

        };
        window.obj = this;
        this.ws.onmessage = function (evt)
        {
           var received_msg = evt.data;
           cc.log("数据已接收...");

           window.obj.genmsg(evt);

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

    onLoad () {
    	this.count = 0;
        this.address = "ws://47.93.234.1:88";
        // this.address = "ws://127.0.0.1:9501";
        // 链接服务器
        // 打开一个 web socket
        this.ws();

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
        this.sendbtnNode.node.on('click', this.sendmsg, this);
        this.noticeNode.runAction(cc.fadeOut(2.5));
 

        this.user = cc.sys.localStorage.getItem("user");
        var head = cc.sys.localStorage.getItem("select_head");
        var user = cc.sys.localStorage.getItem("user");
        if(head != '' && user != '' && user != undefined) {
            var data = {"method": 'reg', "user": user, "head": head};
            this.ws.send(JSON.stringify(data));
        }

        // 监听回车
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.shurukuangNode.getComponent(cc.EditBox).node.on('editing-return', this.sendmsg, this);

    },
    onKeyDown(event) {
        switch(event.keyCode) {
            case cc.macro.KEY.enter:
                console.log('Press a key');
                this.sendmsg();
                break;
        }
    },

    genmsg(evt) {
        // 初始化一个聊天框
        var msgData = evt.data;
        try{
            msgData = JSON.parse(msgData);
        }catch(err) {
            cc.log(err);
            return false;
        }
        if(!msgData) {
            return false;
        }
        cc.log(msgData);
        var msgContent = msgData.user+"说："+msgData.msg;
        var head = msgData.head;
// 初始化一个聊天框		
	    var node = cc.instantiate(this.chatNodePre);
        node.getChildByName('msg').getComponent(cc.Label).string = msgContent;
      
        cc.loader.loadRes("headimg/"+head, cc.SpriteFrame, function (err, spriteFrame) {
            node.getChildByName('head').getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });

	    node.parent = this.chatContentNode;
	    this.scrollviewNode.getComponent(cc.ScrollView).scrollToBottom(0.1);

	},

    start () {

    },

    update (dt) {

    	this.count += 1;
    	if (this.count > 100) {
    		this.count = 0;
    		// 检查是否断开链接
    		if (this.ws.readyState != 1) {
			 	var ws = new WebSocket(this.address);
               this.ws = ws;

               var head = cc.sys.localStorage.getItem("select_head");
               var user = cc.sys.localStorage.getItem("user");
               if(head != '' && user != '' && user != undefined) {
                   var data = {"method": 'reg', "user": user, "head": head};
                   this.ws.send(JSON.stringify(data));
               }
    		}
    		
    	}


    },
});
