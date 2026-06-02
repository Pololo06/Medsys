import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <div className="error-boundary-icon">
              <AlertCircle size={48} />
            </div>
            <h1 className="error-boundary-title">Algo salió mal</h1>
            <p className="error-boundary-message">
              Experimentamos un error inesperado. Por favor, intenta recargar la página o vuelve al inicio.
            </p>
            <div className="error-boundary-actions">
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
              >
                <RefreshCw size={16} />
                Reintentar
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn btn-secondary"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
