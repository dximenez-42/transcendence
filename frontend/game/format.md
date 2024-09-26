# Info format required

---

To create a game online, the client will send a info to the server immediately like this:

```json
{
    action: requestBattleInfo
}
```

It wanna the server give below info with this format:

```json
{
    action: initInfo,
    userId: id,
    userName: username,
    enamyName: enamyname
}
```

---

When the player paddle's position changed, it will send a message to the server with it's id givend by the server

```json
{
    action: updatePadPosition,
    userId: userid,
    x: x_position,
    y: y_posotion
}
```

We expect the below info format to change the pad position

```json
{
    action: UpdatePad,
    x: x_position,
    y: y_posotion
}
```

---

Evetry second the game will send 20 message to update the ball position unlike the paddle which will send 60 message every second to the server to update the message.

```json
{
    action: updateBallPosition,
    userId: userid,
    x: x_position,
    y: y_posotion
}
```

We expect the below info format to change the ball position

```json
{
    action: UpdateBall,
    x: x_position,
    y: y_posotion
}
```

