import React from 'react';
import Router from 'next/router';
import cookie from 'react-cookies';
// import { connect } from "react-redux";

/**
 * 权限验证路由 HOC
 * 使用方式：export default authenticatedRoute(MyComponent, { pathAfterFailure: '/login' })
 * @param {*} Component 
 * @param {*} options 
 */
function checkAuthentication() {
    const token = cookie.load('token');
    console.log('token: %o', token);
    if (!token) {
        return false;
    } else
        return true;
}

const authenticatedRoute = (Component = null, options = {}) => {
    class AuthenticatedRoute extends React.Component {
        state = {
            loading: true,
        };

        componentDidMount() {
            if (checkAuthentication()) { //this.props.isLoggedIn
                this.setState({ loading: false });
            } else {
                Router.push(options.pathAfterFailure || "/login");
            }
        }

        render() {
            const { loading } = this.state;

            if (loading) {
                return <div />;
            }

            return <Component {...this.props} />;
        }
    }

    // Redux 负责注入props的方式，我使用 cookie 判断，用不到。
    // return connect((state) => ({
    //     isLoggedIn: state?.authenticated && !!state?.user,
    // }))(AuthenticatedRoute);

    return AuthenticatedRoute;
};

export default authenticatedRoute;