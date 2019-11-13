cc.Class({
    extends: cc.Component,

    properties: {
        chatNode: {
            default: null,
            type:cc.Node
        },
        msgNodePre: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
            type: cc.Prefab, // optional, default is typeof default
        },
        button: cc.Button
      
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
       this.button.node.on('click', this.callback, this);
    },

    callback() {
        cc.log('惦记');
    },

    start () {

    },

    // update (dt) {},
});
