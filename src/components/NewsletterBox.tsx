import React from "react";

const NewsletterBox: React.FC = () => {
    const onSubmitHandle = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
    }
    
    return (
        <div className="text-center ">
            <p className="font-medium text-gray-800 text-2xl">Subscribe now & get 20% off</p>
            <p className="text-gray-400 mt-3  ">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
            <form onSubmit={onSubmitHandle} className="flex items-center w-full sm:w-1/2 mx-auto gap-3 my-6 border pl-3">
                <input className="w-full sm: flex-1 outline-none " type="email" placeholder="Enter your email" required />
                <button type="submit" className="bg-black text-white text-xs px-10 py-4">SUBCRIBE</button> 
            </form>
        </div>
    );
};

export default NewsletterBox;