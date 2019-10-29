//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import React from 'react'

import ContentContent from '@app/bundles/Content/ContentContent'
import SettingsGroup from '@app/bundles/Settings/SettingsGroup'
import SettingsUserEmail from '@app/bundles/Settings/SettingsUserEmail'
import SettingsUserName from '@app/bundles/Settings/SettingsUserName'

//-----------------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------------
const SettingsUser = () => {

  return (
    <ContentContent>
      <SettingsGroup
        header="User Information">
        <SettingsUserName />
        <SettingsUserEmail />
      </SettingsGroup>
    </ContentContent>
  )
}

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------
export default SettingsUser
