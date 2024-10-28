import NoValue from '../../assets/no_value.png';

const NoValuePage = () => {
    return (
        <div className='flex flex-col justify-center items-center p-10 gap-10'>
            <img src={NoValue} alt="novalue icon" className='w-40' />
            <h1 className='text-black font-semibold text-[14px]'>해당 데이터가 존재하지 않습니다.</h1>
        </div>
    );
}

export default NoValuePage;