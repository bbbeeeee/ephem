import '../css/style.css';
import Birds from './bird';

$('#main').height(window.innerHeight);
let birds = new Birds({
  selector: '#main',
  amount: 15,
  color: '#000',
});
