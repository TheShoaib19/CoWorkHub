// Loader.js
export default function Loader() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="loader">
                <div className="loader-inner"></div>
            </div>
            <style jsx>{`
                .loader {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 80px;
                    height: 80px;
                    border: 8px solid rgba(0, 0, 255, 0.2);
                    border-top: 8px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .loader-inner {
                    width: 60px;
                    height: 60px;
                   
                    border-radius: 50%;
                    opacity: 0.6;
                    animation: pulse 1s infinite ease-in-out;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
}
