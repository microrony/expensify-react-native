import {View} from 'react-native';
import React from 'react';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import KeyboardAvoidingView from '../KeyboardAvoidingView';
import CONST from '../../CONST';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import HeaderGap from '../HeaderGap';
import OfflineIndicator from '../OfflineIndicator';
import compose from '../../libs/compose';
import withNavigation from '../withNavigation';
import withWindowDimensions from '../withWindowDimensions';
import ONYXKEYS from '../../ONYXKEYS';
import {withNetwork} from '../OnyxProvider';
import {propTypes, defaultProps} from './propTypes';
import SafeAreaConsumer from '../SafeAreaConsumer';

class ScreenWrapper extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            didScreenTransitionEnd: false,
        };
    }

    componentDidMount() {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        this.unsubscribeEscapeKey = KeyboardShortcut.subscribe(shortcutConfig.shortcutKey, () => {
            if (this.props.modal.willAlertModalBecomeVisible) {
                return;
            }

            Navigation.dismissModal();
        }, shortcutConfig.descriptionKey, shortcutConfig.modifiers, true);

        this.unsubscribeTransitionStart = this.props.navigation.addListener('transitionStart', () => {
            Navigation.setIsNavigating(true);
        });

        this.unsubscribeTransitionEnd = this.props.navigation.addListener('transitionEnd', () => {
            this.setState({didScreenTransitionEnd: true});
            this.props.onTransitionEnd();
            Navigation.setIsNavigating(false);
        });
    }

    /**
     * We explicitly want to ignore if props.modal changes, and only want to rerender if
     * any of the other props **used for the rendering output** is changed.
     * @param {Object} nextProps
     * @param {Object} nextState
     * @returns {boolean}
     */
    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.state, nextState)
            || !_.isEqual(_.omit(this.props, 'modal'), _.omit(nextProps, 'modal'));
    }

    componentWillUnmount() {
        if (this.unsubscribeEscapeKey) {
            this.unsubscribeEscapeKey();
        }
        if (this.unsubscribeTransitionEnd) {
            this.unsubscribeTransitionEnd();
        }
        if (this.unsubscribeTransitionStart) {
            this.unsubscribeTransitionStart();
        }
    }

    render() {
        return (
            <SafeAreaConsumer>
                {({
                    insets, paddingTop, paddingBottom, safeAreaPaddingBottomStyle,
                }) => {
                    const paddingStyle = {};

                    if (this.props.includePaddingTop) {
                        paddingStyle.paddingTop = paddingTop;
                    }

                    // We always need the safe area padding bottom if we're showing the offline indicator since it is bottom-docked.
                    if (this.props.includeSafeAreaPaddingBottom || this.props.network.isOffline) {
                        paddingStyle.paddingBottom = paddingBottom;
                    }

                    return (
                        <View
                            style={[
                                ...this.props.style,
                                styles.flex1,
                                paddingStyle,
                            ]}
                        >
                            <KeyboardAvoidingView style={[styles.w100, styles.h100, {maxHeight: this.props.windowHeight}]} behavior={this.props.keyboardAvoidingViewBehavior}>
                                <HeaderGap />
                                {// If props.children is a function, call it to provide the insets to the children.
                                    _.isFunction(this.props.children)
                                        ? this.props.children({
                                            insets,
                                            safeAreaPaddingBottomStyle,
                                            didScreenTransitionEnd: this.state.didScreenTransitionEnd,
                                        })
                                        : this.props.children
                                }
                                {this.props.isSmallScreenWidth && (
                                    <OfflineIndicator />
                                )}
                            </KeyboardAvoidingView>
                        </View>
                    );
                }}
            </SafeAreaConsumer>
        );
    }
}

ScreenWrapper.propTypes = propTypes;
ScreenWrapper.defaultProps = defaultProps;

export default compose(
    withNavigation,
    withWindowDimensions,
    withOnyx({
        modal: {
            key: ONYXKEYS.MODAL,
        },
    }),
    withNetwork(),
)(ScreenWrapper);
