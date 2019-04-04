const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const pool = require('../../dbconfig/dbconfig')
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const Joi = require('joi');
const dateformat = require('dateformat');
const logger = require('pino')()

const app = new Koa()
app.use(bodyParser())

const schema = Joi.object().keys({
  todo: Joi.string().min(5).max(60).required()
});

function getTwimlMessage(text) {
  const twiml = new MessagingResponse();
  twiml.message(text);
  return twiml.toString();
}



app.use(async ctx => {

  logger.info('Running the POST method to store TodoItem.')
  // Define the response type
  ctx.type = 'text/xml';

  //const twiml = new MessagingResponse();
  const { Body } = await ctx.request.body
  // Validate arguments
  const result = Joi.validate({ todo: Body }, schema);

  if (result.error) {
    ctx.body = getTwimlMessage(`Error: ${result.error.details[0].message}`)
    logger.info(`There was an error to validate the payload: ${result.error.details[0].message}`)
    return;
  }

  const todoStatus = 0;


  const dueBy = new Date();
  dueBy.setDate(dueBy.getDate() + 9);
  const todoDueBy = dateformat(dueBy, 'yyyy-mm-dd');

  // Persist the todo item
  const item = await create(Body, todoStatus, todoDueBy)
  ctx.body = getTwimlMessage(item ? `TodoItem  created: ${Body}` : 'No TodoItem created')

  logger.info('TodoItem  created.')

})


async function create(todoItem, todoStatus, todoDueBy) {
  try {
    const createdtodoItem =
        `INSERT INTO Todotable
                (todoItem, todoDateAdded, todoStatus, todoDueBy)
                VALUES ('${todoItem}', now(), '${todoStatus}', '${todoDueBy}')`
    const result = await pool.query(createdtodoItem)
    return result
  } catch (error) {
    console.log(error)
  }
}

module.exports = app.callback()