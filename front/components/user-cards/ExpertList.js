function ExportLis(list) {
   let newlist = [];
   list.map(order => {
      let neworder = { ...order }; 
      if (typeof neworder.symbol_name === 'object' && neworder.symbol_name !== null) {
         neworder.symbol_name = neworder.symbol_name.en;
      }
      newlist.push(neworder);
   });
   return newlist;
}
export default ExportLis;
