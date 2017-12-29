// const { Provider } = ReactRedux;
var createStore = Redux.createStore;
var Provider = ReactRedux.Provider;
var connect = ReactRedux.connect;
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
    currentRoom: "",
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
            var newRoom = action.room;
            newState = Object.assign({}, state, { currentRoom: newRoom });
            break;
        case 'write_rooms':
            // var newRooms = state.rooms.concat([action.rooms]);
            newState = Object.assign({}, state, { rooms: action.rooms })
            break;
        case 'add_message':
            // var newRooms = state.rooms.concat([action.rooms]);
            newState = Object.assign({}, state, { messages: action.message })
            break;
        case 'new_messages':
            // var newRooms = state.rooms.concat([action.rooms]);
            newState = Object.assign({}, state, { messages: action.messages })
            break;
    }
    return newState;
}

var store = createStore(reducer, initialState);

var RoomListState = function (state) {
    return {
        currentRoom: state.currentRoom,
        rooms : state.rooms
    }
}
//this.props.[whatever]

var MessagesState = function (state) {
    return {
        currentRoom: state.currentRoom,
        messages: state.messages
    }
}


var RoomInfoState = function (state) {
    return {
        currentRoom: state.currentRoom,
        onlineUsers: state.onlineUsers
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
        writeRooms: function (roomsArray) {
            // comment.id = Date.now();
            dispatch({
                type: 'write_rooms',
                rooms: roomsArray,
            })
        },
        addMessage: function (message) {
            // comment.id = Date.now();
            dispatch({
                type: 'add_message',
                room: roomName,
            })
        },
        newMessages: function (messages) {
            // comment.id = Date.now();
            dispatch({
                type: 'new_messages',
                rooms: roomsArray,
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
const RoomTab = (props) => {//function component
    return (
        <a href="#" className="item active">
            <span className="icon">
                <i className="fa fa-inbox"></i>
            </span>
            <span className="name">{props.roomname}</span>
        </a>
    );
};


class Rooms extends React.Component {
    render() {//class component
        return (
            <div>
                {this.props.rooms_.map(room_ => <RoomTab roomname={room_} />)}
            </div>
        );
    }
}



//init is done by rooms 
//and on init connect, server emmits first set of messages.
class RoomsContainer extends React.Component {
//    this.props.data
/*
    Props that hold state:
      this.props.data; this.props.url; this.props.pollInterval
    Props that dispatch actions:
      this.props.addComment(comment); this.props.setComments(data)
    */
    componentDidMount() {
        
        socket.on('post connect', function (data) {
            console.log('post connect:', data);
            this.props.writeRooms(data.rooms);
            this.props.changeRoom(data.rooms[0]);
        }.bind(this));
    }
    newThreadPrompt() {
        var roomName = prompt("Enter the roomname", "Room name here");
        if (roomName == '' || roomName == null) {
            alert('Roomname empty!');
        } else {
            socket.emit('roomNameCheck', {
                roomName: roomName
            }, function (data) {
                if (data.status == 409) {
                    var roomPass = prompt("Enter the room access password", "Password here");
                } else if (data.status = 200) {
                    var roomPass = prompt("Enter desired password for new room. Leave blank for no password", "Password here");
                }
                socket.emit('roomPassCheck', {
                    username: myuser,
                    roomName: roomName,
                    password: roomPass
                }, function (data) {
                    //append to rooms
                    
                });
            });
        }
    }
    render() {//class component
        return (
            <div>
                <div className="compose has-text-centered" id="newThreadParent">
                    <a onClick={this.newThreadPrompt} className="button is-danger is-block is-bold">
                        <span className="compose">New Thread</span>
                    </a>
                </div>
                <div className="main">
                    <Rooms rooms_={this.props.rooms} />
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
                                <input className="input" id="msgTextBox" type="text" placeholder="{{myuser}}: Enter Message here" onKeyPress={this._handleKeyPress} />
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
    return (
        <div className="box is-primary" >
            <article className="media">
                <div className="media-content">
                    <div className="content" key={props._id}><p>
                        <strong>{ props.user }</strong>
                        <small>@{ props.user }</small>&nbsp;
                        <small>{props.time}</small>
                        <br />{ props.message }</p>
                    </div>
                </div>
            </article>
        </div>
    );
};


class MsgThread extends React.Component {
    render() {//class component
        return (
            <div>
                {this.props.messages_.map(card => <MsgBubble {...card} />)}
            </div>
        );
    }
}


class MessageArea extends React.Component {
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
MessageArea = connect(
    MessagesState
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
