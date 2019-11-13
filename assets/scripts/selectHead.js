
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {


        this.node.on(cc.Node.EventType.MOUSE_DOWN, function (event) {
            cc.sys.localStorage.setItem("select_head", this.node.name);
          }, this);
    },

    start () {

    },

    // update (dt) {},
});
