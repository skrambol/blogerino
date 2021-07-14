import { config } from 'dotenv'

import makeApp from './lib/app'

config()
makeApp(process.env.DB_URL)
  .then(app => {
    app.listen(process.env.PORT, () => {
      console.log(`${process.env.APP_NAME} is listening at port ${process.env.PORT}`)
    })
  })
  .catch(err => console.error(err))
