
// const { Provider } = ReactRedux;
var createStore = Redux.createStore;
var Provider = ReactRedux.Provider;
var connect = ReactRedux.connect;

/**
 * UI functions
 */

function keepAtBottom() {
    $("#inbox-messages").animate({
        scrollTop: $('#inbox-messages').prop("scrollHeight")
    }, 500);
}
/**
 * ~~Redux~~
 * 
 */

var initialState = {
    data: [],
    rooms: [],
    // users: [],
    messages: [],
    onlineUsers: [],
    currentRoom: "welcome",
    url: "/api/comments",
    pollInterval: 2000
}

var reducer = function (state, action) {//@todo
    if (state === undefined) {
        return initialState;
    }
    var newState = state;
    switch (action.type) {
        case 'change_room':
            console.log("RoomChange",action.room);
            var newRoom = action.room;
            newState = Object.assign({}, state, { currentRoom: newRoom });
            break;
        case 'write_rooms':
            // var newRooms = state.rooms.concat([action.rooms]);
            newState = Object.assign({}, state, { rooms: action.rooms })
            break;
        case 'new_room':
            var newRooms = state.rooms.concat([action.room]);
            newState = Object.assign({}, state, { rooms: newRooms})
            // newState = Object.assign({}, state, { rooms: newRooms }) //@todo
            break; 
        case 'add_message':
            var msgRoomObj = state.messages;
            console.log("pr", JSON.stringify(msgRoomObj).length, JSON.stringify(newState).length);
            if (msgRoomObj[action.message.room]) {
                msgRoomObj[action.message.room] = msgRoomObj[action.message.room].concat([action.message]);
            } else {
                msgRoomObj[action.message.room] = [action.message];
            }
            newState = Object.assign({}, state, { messages: msgRoomObj })
            console.log("po", JSON.stringify(msgRoomObj).length, JSON.stringify(newState).length);
            keepAtBottom();
            break;
        case 'new_messages':
            var msgRoomObj = state.messages;
            // msgRoomObj["aaa"] = [{ message: "aaa", room: "aaa", ts: "Sun Dec 31 2017 06:02:15 GMT+0530 (IST)" }]
            action.messages.forEach(function(msg){
                if (msgRoomObj[msg.room]){
                    msgRoomObj[msg.room] = msgRoomObj[msg.room].concat(msg);
                }else{
                    msgRoomObj[msg.room] = [msg];
                }
            });
            newState = Object.assign({}, state, { messages: msgRoomObj});
            setTimeout(() => {
                keepAtBottom();
            }, 500);
            
            break;
    }
    return newState;
}

var store = createStore(reducer, initialState);

var RoomListState = function (state) {
    return {
        currentRoom: state.currentRoom,
        rooms : state.rooms,
        messages: state.messages
    }
}
//this.props.[whatever]

var MessagesState = function (state) {
    return {
        currentRoom: state.currentRoom,
        messages: state.messages[state.currentRoom]
    }
}


var RoomInfoState = function (state) {
    return {
        currentRoom: state.currentRoom,
        onlineUsers: state.onlineUsers,
        messages: state.messages
    }
}


var RoomDispatch = function (dispatch) {
    return {
        changeRoom: function (roomName) {
            // comment.id = Date.now();
            dispatch({
                type: 'change_room',
                room: roomName,
            })
        },
        newRoom: function (room) {
            // comment.id = Date.now();
            dispatch({
                type: 'new_room',
                room: room,
            })
        },
        writeRooms: function (roomsArray) {
            // comment.id = Date.now();
            dispatch({
                type: 'write_rooms',
                rooms: roomsArray,
            })
        },
        addMessage: function (message) {
            console.log("newaddmsgtrig",message);
            // comment.id = Date.now();
            dispatch({
                type: 'add_message',
                message: message,
            })
        },
        newMessages: function (messages) {
            // comment.id = Date.now();
            dispatch({
                type: 'new_messages',
                messages: messages,
            })
        }
    }
}

// var MessagesDispatch = function (dispatch) {
//     return {
        
//     }
// }

/**
 * ~~React.JS~~
 * 
 */
var socket = io.connect();
socket.emit('connected', {
    username: myuser,
    hash: userhash
}, function (data) {
    console.log(data);
});
/**
 * Room list
 */
class RoomTab extends React.Component {//function component
    constructor(props) {
        super(props);
        this.roomTabClick = this.roomTabClick.bind(this);
    }
    roomTabClick(){
        mobMaster();
        this.props.changeRoom(this.props.roomname);
    }
    render(){

        return (
            <a className="item active roomTab" data-rn={this.props.roomname} onClick={this.roomTabClick}>
            <span className="icon">
                <i className="fa fa-inbox"></i>
            </span>
            <span className="name">{this.props.roomname}</span>
            </a>
        );
    }   
};


class Rooms extends React.Component {
    render() {//class component
        return (
            <div>
                {this.props.rooms_.map(room_ => <RoomTab roomname={room_}  />)}
            </div>
        );
    }
}



//init is done by rooms 
//and on init connect, server emmits first set of messages.
class RoomsContainer extends React.Component {
    constructor(props) {
        super(props);
        this.switchRoom = this.switchRoom.bind(this);
        this.newThreadPrompt = this.newThreadPrompt.bind(this);
    }
//    this.props.data
/*
    Props that hold state:
      this.props.data; this.props.url; this.props.pollInterval
    Props that dispatch actions:
      this.props.addComment(comment); this.props.setComments(data)
    */
    componentDidMount() {
        console.log('mount Rooms container');
        socket.on('post connect', function (data) {
            console.log('post connect:', data);
            this.props.writeRooms(data.rooms);
            this.props.changeRoom(data.rooms[0]);
            this.fetchMessages(data.rooms[0]);
        }.bind(this));

        socket.on('new message', function (data) {
            console.log('newMsg:', data);
            this.props.addMessage(data);
        }.bind(this));
        
    }

    fetchMessages(roomN){
        //@todo:switchtoajax maybe?
        socket.emit('fetchMessages', {
            roomname:roomN
        });
        this.props.changeRoom(roomN);
        socket.on('fetchMessagesResponse',function(data){
            console.log("check",data)
            if (data) {
                this.props.newMessages(data);
            }
        }.bind(this));
    }

    switchRoom(){
        console.log('swr-called');
        fetchMessages($(this).data('rn'));
    }

    newThreadPrompt() {
        var roomName = prompt("Enter the roomname", "Room name here");
        if (roomName == '' || roomName == null) {
            alert('Roomname empty!');
        } else {
            socket.emit('roomNameCheck', {
                roomName: roomName
            });
            socket.on('roomNameCheckRet', function (data) {
                console.log("roomNameCheckRet",data);
                if (data.status == 409) {
                    var roomPass = prompt("Enter the room access password", "Password here");
                } else if (data.status == 200) {
                    var roomPass = prompt("Enter desired password for new room. Leave blank for no password", "");
                }else{
                    alert(data.message);
                    return;
                }
                socket.emit('roomPassCheck', {
                    username: myuser,
                    roomName: roomName,
                    password: roomPass
                });
                socket.on('roomPassCheckRet',function(data_){
                    console.log(data_);
                    if(data_.status!=200)
                        return alert(data_.message);
                    this.props.newRoom(data_.room.roomname);
                }.bind(this))
            }.bind(this))
        }
    }
    render() {//class component
        return (
            <div>
                <div className="compose has-text-centered" id="newThreadParent">
                    <a onClick={this.newThreadPrompt} className="button is-danger is-block is-bold">
                        <span className="compose">New/Join Thread</span>
                    </a>
                </div>
                <div className="main">
                    <Rooms rooms_={this.props.rooms} switchRoomEv={this.switchRoom} />
                </div>
            </div>
        );
    }
}

//two callbacks for new thread
class MsgBox extends React.Component {
    constructor(props) {
        super(props);
        this.sendMessage = this.sendMessage.bind(this);
    }
    componentDidMount() {
        // messageBoxResize();
        $("#messageSend").width($("#message-feed").width());
        // socket.on
    }
    sendMessage() {
        var msgTextBoxVal = document.getElementById("msgTextBox").value;
        console.log("MessageSend:",msgTextBoxVal,"at", this.props.currentRoom_);
        document.getElementById("msgTextBox").value = '';
        socket.emit('send message', {
            message: msgTextBoxVal,
            room: this.props.currentRoom_
        });
    }
    _handleKeyPress(e) {
        if (e.key === 'Enter') {
            document.getElementById("msgSendBtn").click();
        }
    }
    render() {
        return (
            <div className="hero-foot" id="makeVisible">
                <div className="container">
                    <div className="tabs is-centered">
                        <div className="field has-addons" id="messageSend" >
                            <p className="control is-expanded">
                                <input className="input" id="msgTextBox" type="text" placeholder={myuser + ": Enter Message here"} onKeyPress={this._handleKeyPress} />
                            </p>
                            <p className="control ">
                                <a id="msgSendBtn" onClick={this.sendMessage} className="button is-primary">
                                    Send
                            </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}


/**
 * Message thread
 */
const MsgBubble = (props) => {//function component
    // function classNames(){
    //     if (props.user == myuser)
    //         return "box "
    // }
    return (
        <div className={(props.user==myuser)?"box mymsg":"box is-primary"} >
            <article className="media">
                <div className="media-content">
                    <div className="content" key={props._id}><p>
                        <strong>{ props.user }</strong>
                        <small>@{ props.user }</small>&nbsp;
                        <small className="dynamicTimeStamp" data-ts={props.ts}>{moment.parseZone(props.ts, "ddd MMM DD YYYY HH:mm:ss Z").fromNow()}</small>
                        <br />{ props.message }</p>
                    </div>
                </div>
            </article>
        </div>
    );
};

const MsgBubbleZero = (props) => {//function component
    return (
        <div className="box is-primary" >
            <article className="media">
                <div className="media-content">
                    <div className="content" key={props._id}>
                        <strong>There are no messages in this channel yet.</strong>
                        <p>Please start the converstaion using the message box below.</p>
                    </div>
                </div>
            </article>
        </div>
    );
};


class MsgThread extends React.Component {
    constructor(props) {
        super(props);
        // this.sendMessage = this.sendMessage.bind(this);
    }
    // console.log(this.props);
    render() {//class component
        return (
            <div>
                {/* {JSON.stringify(this.props.messages_)} */}
                {
                    (this.props.messages_ && this.props.messages_.length >0)?
                    this.props.messages_.map(card => <MsgBubble {...card} />)
                    :<MsgBubbleZero />
                }
            </div>
        );
    }
}


class MessageArea extends React.Component {
    constructor(props) {
        super(props);
    }
    // addMessage,newMessages //write using socket.io
    /*
    Props that hold state:
      this.props.data; this.props.url; this.props.pollInterval
    Props that dispatch actions:
      this.props.addComment(comment); this.props.setComments(data)
    */
    componentDidMount() {
        // console.log("msgarea:",currRoom);
    }
    render() {//class component
        return (
            <div>
                <h1 id="currRoomName">{this.props.currentRoom}</h1>
                <div class="inbox-messages" id="inbox-messages">
                    <MsgThread messages_={this.props.messages} />
                </div> 
                <MsgBox currentRoom_={this.props.currentRoom} />
            </div>
            
        );
    }
}


/**
 * Room Info
 */
const OnlineUser = (prop) => {
    render(
        <span className="panel-block">
            <span className="panel-icon">
                <i className="fa fa-user"></i>
            </span>User1
        </span>
    );
}

class OnlineUsers extends React.Component {
    componentDidMount() {
       
    }
    render() {//class component
        return (
            <div>
            <p className="panel-heading">
                Active users
            </p>
            <div>
                {this.props.onlineUsers.map(onlineUser => <OnlineUser  />)}
            </div>
            </div>
        );
    }
}

RoomsContainer = connect(
    RoomListState,
    RoomDispatch
)(RoomsContainer)
RoomTab = connect(
    RoomListState,
    RoomDispatch
)(RoomTab)
MessageArea = connect(
    MessagesState,
    RoomDispatch
)(MessageArea)
OnlineUsers = connect(
    RoomInfoState
)(OnlineUsers)


ReactDOM.render(
    <Provider store={store}>
        <MessageArea />
    </Provider >,
    document.getElementById('message-feed')
);


ReactDOM.render(
    <Provider store={store}>
        <OnlineUsers />
    </Provider>,
    document.getElementById('activeUserpanel')
);
// ReactDOM.render(
//     <NewThread />,
//     document.getElementById('newThreadParent')
// );
ReactDOM.render(
    <Provider store={store}>
        <RoomsContainer />
    </Provider>,
    document.getElementById('conv-list')
);

// ReactDOM.render(
//     <RoomsContainer />,
//     document.getElementById('roomsList')
// );
