from flask import Flask, jsonify, render_template, request
import socket
import time

app = Flask(__name__, template_folder='.')
conn = None

@app.route("/sendCommand", methods=['POST'])
def sendCommand():
    req = request.get_json()
    if conn:

        conn.send(bytes(req['yr']+'\n', 'UTF-8'))
        print(conn.recv(16))

        conn.send(bytes(req['yl']+'\n', 'UTF-8'))
        print(conn.recv(16))
        
        conn.send(bytes(req['yl']+'\n', 'UTF-8'))
        print(conn.recv(16))



    return jsonify({})

@app.route("/", methods=['GET'])
def index():
    return render_template('index.html')


if __name__ == '__main__':
    # macAddr = '00:20:04:32:0b:5a'
    # port = 1
    # s = socket.socket(socket.AF_BLUETOOTH, socket.SOCK_STREAM, socket.BTPROTO_RFCOMM)
    # print('connecting...')
    # s.connect((macAddr,port))
    # conn = s
    # print('connected.')
    
    app.run(debug=False, host='192.168.15.179', port=9001)
    app.run(debug=False)
    