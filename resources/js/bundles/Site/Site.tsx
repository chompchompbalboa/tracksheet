//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import React, { useState } from 'react'
import styled from 'styled-components'

import SiteFeatures from '@site/SiteFeatures'
import SiteFooter from '@site/SiteFooter'
import SiteSplash from '@site/SiteSplash'

//-----------------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------------
const Site = () => {
  
  const [ isLoginOrRegister, setIsLoginOrRegister ] = useState('LOGIN' as 'LOGIN' | 'REGISTER')
  
  return (
    <Container>
      <SiteSplash
        isLoginOrRegister={isLoginOrRegister}
        setIsLoginOrRegister={setIsLoginOrRegister}/>
      <SiteFeatures 
        setIsLoginOrRegister={setIsLoginOrRegister}/>
      <SiteFooter />
    </Container>
  )
}

//-----------------------------------------------------------------------------
// Styled Components
//-----------------------------------------------------------------------------
const Container = styled.div``

export default Site
