import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught:', error);
        console.error('Error Component Stack', errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h1>Something went wrong.</h1>
                    <p>Please try refreshing the page.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 