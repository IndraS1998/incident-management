export default function PageLoader(){
    return(
        <div className="fixed inset-0 bg-white/70 backdrop-blur-[2px] z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-solid border-t-[#2A2A72] border-r-[#2A2A72] border-b-transparent border-l-transparent"></div>
        </div>
    )
}