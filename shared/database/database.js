import { Sequelize } from 'sequelize'
import { config } from '../config.js'

const { dialect, name, user, password, host, port, logging } = config.database
const log = logging ? console.log : false

const sequelize = dialect === 'sqlite'
    ? new Sequelize({ dialect, storage: name, logging: log })
    : new Sequelize(name, user, password, { dialect, host, port, logging: log })

export default sequelize
