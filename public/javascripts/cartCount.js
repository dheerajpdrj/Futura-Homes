
const count = async () => {
    try {
        const res = await axios.get('/cartCount', {
        }).then((e) => {
            console.log(e.data.cartcount)
            document.getElementById('cart-count').innerHTML = e.data.cartcount
        })
    } catch (err) {
        console.log(err)
    }
   try{
    let res= await axios.get('/wishlistcount',{}).then((e)=>{
        document.getElementById('wishlist-count').innerHTML= e.data.wishlistcount;
        console.log(e.data.wishlistcount)
    })
   }catch(err){
    console.log(err);
   }


}
document.addEventListener("DOMContentLoaded", count)