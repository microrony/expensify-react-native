import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import * as Localize from '../../../../libs/Localize';
import ROUTES from '../../../../ROUTES';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import TextInput from '../../../../components/TextInput';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../../libs/actions/PersonalDetails';
import compose from '../../../../libs/compose';

const propTypes = {
    /* Onyx Props */

    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    privatePersonalDetails: {
        legalFirstName: '',
        legalLastName: '',
    },
};

class LegalNamePage extends Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        this.updateLegalName = this.updateLegalName.bind(this);
    }

    /**
     * Submit form to update user's legal first and last name
     * @param {Object} values
     * @param {String} values.legalFirstName
     * @param {String} values.legalLastName
     */
    updateLegalName(values) {
        PersonalDetails.updateLegalName(
            values.legalFirstName.trim(),
            values.legalLastName.trim(),
        );
    }

    /**
     * @param {Object} values
     * @param {String} values.legalFirstName
     * @param {String} values.legalLastName
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
        const errors = {};

        // Check for invalid characters in legal first and last name
        const [invalidLegalFirstNameCharacter, invalidLegalLastNameCharacter] = ValidationUtils.findInvalidSymbols(
            [values.legalFirstName, values.legalLastName],
        );
        const [hasLegalFirstNameLengthError, hasLegalLastNameLengthError] = ValidationUtils.doesFailCharacterLimitAfterTrim(
            CONST.LEGAL_NAMES_CHARACTER_LIMIT,
            [values.legalFirstName, values.legalLastName],
        );

        if (!_.isEmpty(invalidLegalFirstNameCharacter)) {
            errors.legalFirstName = Localize.translateLocal(
                'privatePersonalDetails.error.hasInvalidCharacter',
                {invalidCharacter: invalidLegalFirstNameCharacter},
            );
        } else if (_.isEmpty(values.legalFirstName)) {
            errors.legalFirstName = Localize.translateLocal('common.error.fieldRequired');
        } else if (hasLegalFirstNameLengthError) {
            errors.legalFirstName = Localize.translateLocal('common.error.characterLimit', {limit: CONST.LEGAL_NAMES_CHARACTER_LIMIT});
        }

        if (!_.isEmpty(invalidLegalLastNameCharacter)) {
            errors.legalLastName = Localize.translateLocal(
                'privatePersonalDetails.error.hasInvalidCharacter',
                {invalidCharacter: invalidLegalLastNameCharacter},
            );
        } else if (_.isEmpty(values.legalLastName)) {
            errors.legalLastName = Localize.translateLocal('common.error.fieldRequired');
        } else if (hasLegalLastNameLengthError) {
            errors.legalLastName = Localize.translateLocal('common.error.characterLimit', {limit: CONST.LEGAL_NAMES_CHARACTER_LIMIT});
        }

        return errors;
    }

    render() {
        const privateDetails = this.props.privatePersonalDetails || {};

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('privatePersonalDetails.legalName')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.LEGAL_NAME_FORM}
                    validate={this.validate}
                    onSubmit={this.updateLegalName}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={[styles.mb4]}>
                        <TextInput
                            inputID="legalFirstName"
                            name="lfname"
                            label={this.props.translate('privatePersonalDetails.legalFirstName')}
                            defaultValue={privateDetails.legalFirstName || ''}
                        />
                    </View>
                    <View>
                        <TextInput
                            inputID="legalLastName"
                            name="llname"
                            label={this.props.translate('privatePersonalDetails.legalLastName')}
                            defaultValue={privateDetails.legalLastName || ''}
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

LegalNamePage.propTypes = propTypes;
LegalNamePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
    }),
)(LegalNamePage);
