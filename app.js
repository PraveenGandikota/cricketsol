const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'cricketTeam.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhot:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.playerId,
    playerName: dbObject.player_Name,
    jerseyNumber: dbObject.jersey_Number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
      select
        *
      from
        cricket_team;`
  const playersArray = await database.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayersQuery = `
      select
      *
      from
        cricket_team;
      where
        player_id=${playerId}`
  const player = await database.get(getPlayersQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayersQuery = `
      insert into
        cricket_team (player_name,jersey_number,role)
      Values
        ('${playerName}',${jerseyNumber},'${role}');`
  const player = await database.run(postPlayersQuery)
  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updatePlayersQuery = `
      update
        cricket_team
      set
        player_name='${playerName}',
        jersey_name='${jerseyNumber}',
        role = '${role}'
      where
        player_id=${playerId}`
  await database.run(updatePlayersQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayersQuery = `
      delete
        from
        cricket_team;
      where
        player_id = ${playerId};`
  await database.run(deletePlayersQuery)
  response.send('Player Removed')
})
module.exports = app
