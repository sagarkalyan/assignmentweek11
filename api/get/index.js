const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const pool = require('../../dbconfig/dbconfig')
const logger = require('pino')()


const app = new Koa()
app.use(bodyParser())


app.use(async ctx => {
  logger.info('Running GET method to get todo list.')

  // Filter by id, if specified
  const todoId = await ctx.request.body.todoId
  if (todoId) {
    const item = await get(todoId)
    ctx.body = item || `No todo item was found with the id ${todoId}`
  } else { // Retrieve all todo items
    const list = await list()
    ctx.body = list || 'No todo items were found'
  }

})


async function get(todoId) {
  try {
    const qetTodoItem = `SELECT * FROM Todotable WHERE todoId = ${todoId}`
    const result = await pool.query(qetTodoItem)
    return result[0]
  } catch(error) {
    console.log(error)
  }
}

async function list() {
  try {
    const query = 'SELECT * FROM Todotable ORDER BY todoStatus, todoDueBy, todoItem'
    const result = await pool.query(query)
    return result
  } catch(error) {
    console.log(error)
  }
}

module.exports = app.callback()





/*
app.use(async ctx => {

  const todoItem = await ctx.request.body.todoItem
  const returnedtodoItem = await getTodoItem(todoItem)
  ctx.body = returnedtodoItem

})

async function getTodoItem(todoItem) {
  try {
    const gettodoitem = await pool.query(`SELECT * FROM Todotable WHERE todoItem LIKe '%${todoItem}%';`)
    return gettodoitem[0]
  }catch(e){
    console.error(e)
  }
}

module.exports = app.callback()
*/