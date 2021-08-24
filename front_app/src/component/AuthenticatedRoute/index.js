import React from 'react';
import Router from 'next/router';
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
// import { connect } from "react-redux";

/**
* 权限验证路由 HOC
* 使用方式：export default authenticatedRoute(MyComponent, { pathAfterFailure: '/login' })
* @param {*} Component 
* @param {*} options 
*/
const authenticatedRoute = (Component = null, options = {}) => {
    class AuthenticatedRoute extends React.Component {

        static propTypes = {
            cookies: instanceOf(Cookies).isRequired
        };

        state = {
            loading: true,
        };

        checkAuthentication() {
            // console.log('state: %o', this.state);
            let { token } = this.state;
            console.log('token: %o', token);
            if (token == undefined) {
                return false;
            } else
                return true;
        }

        constructor(props) {
            super(props);
            const { cookies } = props;
            // console.log('cookies: %o', cookies);
            // console.log('length: %o', cookies.cookies);
            let token = cookies.get('token');
            // console.log('final token: %o', token);

            // if (!token) {
            //     cookies.set('token', 'xxxyy', { path: '/' })
            // }
            // token = cookies.get('token');
            this.state.token = token;
        }

        componentDidMount() {
            // Cookies.save('token', 'xxxyy', { path: "/" })
            let res = this.checkAuthentication();
            if (res) { //this.props.isLoggedIn
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

    return withCookies(AuthenticatedRoute);
};

export default authenticatedRoute;