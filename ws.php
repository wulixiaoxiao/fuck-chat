<?php

use Swoole\Coroutine\Redis;
class WebsocketTest {
    public $server;
    public function __construct() {

        $this->server = new Swoole\WebSocket\Server("0.0.0.0", 88);
        $this->server->on('open', function (swoole_websocket_server $server, $request) {
            echo "server: handshake success with fd{$request->fd}\n";
            foreach ($this->server->connections as $fd) {
                // 需要先判断是否是正确的websocket连接，否则有可能会push失败
                if ($this->server->isEstablished($fd) && $fd != $request->fd) {
//                    $this->server->push($fd, "有个吊毛上线了。。猜猜是谁");
                }
            }
        });
        $this->server->on('message', function (Swoole\WebSocket\Server $server, $frame) {
//            echo "收到消息 {$frame->fd}:{$frame->data},opcode:{$frame->opcode},fin:{$frame->finish}\n";
            $redis = new Swoole\Coroutine\Redis();
            $redis->connect('127.0.0.1', 6379);

            $data = json_decode($frame->data, true);

            echo "收到消息".json_encode($frame->data);
            if ($data) {
                if ($data['method'] == 'reg') {
                    $ip = $server->connection_info($frame->fd)['remote_ip'];
                    $user['user'] = $data['user'];
                    $user['head'] = $data['head'];
                    $user['ip'] = $ip;
                    $user['fd'] = $frame->fd;
                    $redis->hSet('user', $data['user'], json_encode($user, true));
                    $userInfo = $user;

                    // 发送消息记录
                    $msgList = $redis->lRange('msg_logs', 0, 50);
                    $msgList = json_encode($msgList);
                    $this->server->push($frame->fd, $msgList);
                    return false;
                }
            }

            $userInfo = $redis->hGet('user', $data['user']);
            echo "读取消息".$userInfo;
            $userInfo = json_decode($userInfo, true);
//            $server->push($frame->fd, "this is server");
            foreach ($this->server->connections as $fd) {
                // 需要先判断是否是正确的websocket连接，否则有可能会push失败
                if ($this->server->isEstablished($fd) && $fd != $frame->fd && isset($userInfo['user']) && !empty($userInfo['user'])) {
                    $msg = [];
                    $msg['user'] = $userInfo['user'];
                    $msg['head'] = $userInfo['head'];
                    $msg['msg'] = $data['msg'];

                    echo "发送消息\r\n";
                    $msg = json_encode($msg);
                    echo $msg;
                    $this->server->push($fd, $msg);

                    // 保存消息
                    $redis->lPush('msg_logs', $msg);

                    echo "=============>\r\n";
                }
            }
            // todo 保存消息
//            $redis = new Swoole\Coroutine\Redis();
//            $redis->connect('redis', 6379);
//            $val = $redis->hSet('chat_logs', );


        });
        $this->server->on('close', function ($ser, $fd) {
            echo "client {$fd} closed\n";
            foreach ($this->server->connections as $fd) {
                // 需要先判断是否是正确的websocket连接，否则有可能会push失败
                if ($this->server->isEstablished($fd)) {
//                    $this->server->push($fd, "吊毛_{$fd}已下线。。。");
                }
            }
        });
        $this->server->on('request', function ($request, $response) {
            // 接收http请求从get获取message参数的值，给用户推送
            // $this->server->connections 遍历所有websocket连接用户的fd，给所有用户推送
            foreach ($this->server->connections as $fd) {
                // 需要先判断是否是正确的websocket连接，否则有可能会push失败
                if ($this->server->isEstablished($fd)) {
                    $this->server->push($fd, $request->get['message']);
                }
            }
        });
        $this->server->start();
    }


}
new WebsocketTest();