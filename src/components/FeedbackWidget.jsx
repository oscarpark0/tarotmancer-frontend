import { Widget } from '@happyreact/react';
import '@happyreact/react/theme.css';
import { HAPPYREACT_TOKEN } from '../utils/config';
 
function FeedbackWidget() {
  return <Widget token={HAPPYREACT_TOKEN} resource="users-happiness" />;
}

export default FeedbackWidget;