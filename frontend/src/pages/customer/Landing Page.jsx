import { Link } from 'react-router-dom'
export const Landing_Page = () => {
    return (
        <div className="">
            <div className='ml-11 mr-6'>
                <div className="m-6 flex justify-between ">
                    <div>
                        <h1 className="flex flex-row text-xl font-bold"><h2>Order Food</h2></h1>
                    </div>
                    <div className="flex flex-row gap-4">
                        <Link to="/login">
                            <button className="text-[#E23E3E] font-['Roboto'] w-[120px] h-[38px] border border-[#E23E3E] text-xl rounded-xl">
                                Login
                            </button>
                        </Link>

                        <Link to="/signup">
                            <button className="bg-[#E23E3E] text-white font-['Roboto'] w-[120px] h-[38px] text-xl rounded-xl">
                                Sign up
                            </button>
                        </Link>
                    </div>

                </div>
                <div className="grid grid-cols-2">
                    <div className=''>
                        <div className='text-7xl font-bold'>
                            <h1 className='mb-4 mt-8'>Order <span className='text-[#E23E3E]'>Your</span> </h1>
                            <h1 className='mb-2'><span className='text-[#E23E3E]'>Favorite</span> Food</h1>
                        </div>
                        <div>
                            <p className='text-2xl mb-5 font-light'>just confirm your order and enjoy <p>your delicious fastest delivery</p></p>
                        </div>
                        <div>
                            <Link to="/nearby">
                                <button className="bg-[#E23E3E] text-white font-['Roboto'] w-[140px] h-[43px] text-xl rounded-xl font-semibold">Order now</button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-5 mt-10 gap-1 font-bold text-xl font-['Inria Serif']">
                            <div>
                                <h1>200+</h1>
                                <p className='text-[#E23E3E]'>Food</p>
                            </div>
                            <div>
                                <h1>1000+</h1>
                                <p className='text-[#E23E3E]'>Review</p>
                            </div>
                            <div>
                                <h1>100+</h1>
                                <p className='text-[#E23E3E]'>Restaurant</p>
                            </div>
                        </div>
                    </div>
                    <div className='w-[500px] h-[500px] '>
                        <img src="/pngtree-food-delivery-by-scooters-free-download-png-image_16940462.png" alt="" />
                    </div>
                </div>

            </div>
        </div>
    )
}