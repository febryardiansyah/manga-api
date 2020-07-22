'use strict';
const e = React.createElement;
const App = require('./app')

const domContainer = document.querySelector('#root');
ReactDOM.render(e(App), domContainer);