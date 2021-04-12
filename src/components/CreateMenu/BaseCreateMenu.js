import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Popover from '../Popover';
import styles from '../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import MenuItem from '../MenuItem';
import createMenuPropTypes from './CreateMenuPropTypes';

const propTypes = {
    // Callback fired when the menu is completely closed
    onModalHide: PropTypes.func,

    ...createMenuPropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    onModalHide: () => {},
};

class BaseCreateMenu extends PureComponent {
    render() {
        return (
            <Popover
                onClose={this.props.onClose}
                isVisible={this.props.isVisible}
                onModalHide={this.props.onModalHide}
                anchorPosition={styles.createMenuPosition}
            >
                <View style={this.props.isSmallScreenWidth ? {} : styles.createMenuContainer}>
                    {this.props.menuItems.map(item => (
                        <MenuItem
                            key={item.text}
                            icon={item.icon}
                            title={item.text}
                            onPress={() => this.props.onItemSelected(item)}
                        />
                    ))}
                </View>
            </Popover>
        );
    }
}

BaseCreateMenu.propTypes = propTypes;
BaseCreateMenu.defaultProps = defaultProps;
export default withWindowDimensions(BaseCreateMenu);
