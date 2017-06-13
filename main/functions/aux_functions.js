function randomInt(value){
  if(typeof value === 'number' && value > 0){
      return Math.random()*value;
  }
  return 0;
}
