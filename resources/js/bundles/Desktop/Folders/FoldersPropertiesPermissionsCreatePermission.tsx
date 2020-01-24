//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { PLUS_SIGN } from '@/assets/icons'

import { mutation } from '@/api'

import { IAppState } from '@/state'
import { IFolder, IFolderPermission } from '@/state/folder/types'

import { createFolderPermission } from '@/state/folder/actions'

import FoldersPropertiesPermissionsPermissionRoles from '@desktop/Folders/FoldersPropertiesPermissionsPermissionRoles'
import Icon from '@/components/Icon'

//-----------------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------------
const FoldersPropertiesPermissionsCreatePermission = ({
  folderId
}: IFoldersPropertiesPermissionsCreatePermission) => {
  
  // Refs
  const errorContainer = useRef(null)
  
  // Redux
  const dispatch = useDispatch()
  const userColorPrimary = useSelector((state: IAppState) => state.user.color.primary)
  
  // State
  const [ createPermissionStatus, setCreatePermissionStatus ] = useState('READY' as ICreatePermissionStatus)
  const [ createPermissionEmail, setCreatePermissionEmail ] = useState('')
  const [ createPermissionRole, setCreatePermissionRole ] = useState('USER' as IFolderPermission['role'])
  const [ isEmailInputFocused, setIsEmailInputFocused ] = useState(false)
  const [ isErrorContainerVisible, setIsErrorContainerVisible] = useState(false)
  
  // Listen for keydown while the email input is focused
  useEffect(() => {
    if(isEmailInputFocused) {
      addEventListener('keydown', handleKeydownWhilEmailInputIsFocused)
    }
    else {
      removeEventListener('keydown', handleKeydownWhilEmailInputIsFocused)
    }
    return () => removeEventListener('keydown', handleKeydownWhilEmailInputIsFocused)
  }, [ createPermissionEmail, isEmailInputFocused ])
  
  // Listen for click while the error container is visible
  useEffect(() => {
    if(isErrorContainerVisible) {
      addEventListener('click', handleClickWhileErrorContainerIsVisible)
    }
    else {
      removeEventListener('click', handleClickWhileErrorContainerIsVisible)
    }
    return () => removeEventListener('click', handleClickWhileErrorContainerIsVisible)
  }, [ isErrorContainerVisible ])
  
  // Handle Keydown While Email Input Is Focused
  const handleClickWhileErrorContainerIsVisible = (e: MouseEvent) => {
    if(!errorContainer.current.contains(e.target)) {
      setIsErrorContainerVisible(false)
      setCreatePermissionStatus('READY')
    }
  }
  
  // Handle Create Folder Permission
  const handleCreateFolderPermission = () => {
    setCreatePermissionStatus('CREATING')
    mutation.createFolderPermission(folderId, createPermissionEmail, createPermissionRole)
      .then(response => { // Permission was sucessfully created
        setTimeout(() => {
          setCreatePermissionStatus('CREATED')
        }, 500)
        setTimeout(() => {
          dispatch(createFolderPermission(response.data as IFolderPermission))
          setCreatePermissionStatus('READY')
          setCreatePermissionEmail('')
          setCreatePermissionRole('USER')
        }, 1500)
      })
      .catch(error => {
        if(error.response.status === 404) { // User not found
          setTimeout(() => {
            setIsErrorContainerVisible(true)
            setCreatePermissionStatus('USER_NOT_FOUND')
          }, 500)
        }
        else if(error.response.status === 400) { // User already has permission
          setTimeout(() => {
            setIsErrorContainerVisible(true)
            setCreatePermissionStatus('USER_ALREADY_HAS_PERMISSION')
          }, 500)
        }
        else { // Generic error
          setIsErrorContainerVisible(true)
          setCreatePermissionStatus('ERROR')
        }
      })
  }
  
  // Handle Keydown While Email Input Is Focused
  const handleKeydownWhilEmailInputIsFocused = (e: KeyboardEvent) => {
    if(e.key === 'Enter') {
      handleCreateFolderPermission()
    }
  }
  
  // Create Permission Statuses
  const createPermissionStatuses = {
    READY: <Icon icon={PLUS_SIGN} size="0.7rem"/>,
    CREATING: "Creating",
    USER_NOT_FOUND: <Icon icon={PLUS_SIGN} size="0.7rem"/>,
    USER_ALREADY_HAS_PERMISSION: <Icon icon={PLUS_SIGN} size="0.7rem"/>,
    ERROR: "Something went wrong. Please try again.",
    CREATED: "Created!",
  }
  
  // Error Messages
  const errorMessages = {
    READY: "",
    CREATING: "",
    USER_NOT_FOUND: "We couldn't find a user with that email address. Would you like to send an email to " + createPermissionEmail + " inviting them to Tasksheet?",
    USER_ALREADY_HAS_PERMISSION: "That user already has the appropriate permissions to access this folder",
    ERROR: "Uh oh, something went wrong. Please try again.",
    CREATED: "",
  }
  
  return (
    <Container>
      <Name>
      </Name>
      <Email>
        <StyledInput
          placeholder={isEmailInputFocused ? "" : "Email Address..."}
          value={createPermissionEmail || ''}
          onBlur={() => setIsEmailInputFocused(false)}
          onChange={e => setCreatePermissionEmail(e.target.value)}
          onFocus={() => setIsEmailInputFocused(true)}
          textAlign="center"/>
        {isErrorContainerVisible &&
          <ErrorContainer
            ref={errorContainer}>
            <ErrorMessage>
              {errorMessages[createPermissionStatus]}
            </ErrorMessage>
            {createPermissionStatus === 'USER_NOT_FOUND' &&
              <ErrorButton
                userColorPrimary={userColorPrimary}>
                Send Invitation
              </ErrorButton>
            }
          </ErrorContainer>
        }
      </Email>
      <Actions>
        <FoldersPropertiesPermissionsPermissionRoles
          activeRole={createPermissionRole}
          onRoleChange={(nextRole: IFolderPermission['role']) => setCreatePermissionRole(nextRole)}/>
        <Create
          createPermissionStatus={createPermissionStatus}
          onClick={() => handleCreateFolderPermission()}>
          {createPermissionStatuses[createPermissionStatus]}
        </Create>
      </Actions>
    </Container>
  )
}

//-----------------------------------------------------------------------------
// Props
//-----------------------------------------------------------------------------
interface IFoldersPropertiesPermissionsCreatePermission {
  folderId: IFolder['id']
}

type ICreatePermissionStatus = 'READY' | 'CREATING' | 'USER_NOT_FOUND' | 'USER_ALREADY_HAS_PERMISSION' |'ERROR' | 'CREATED'

//-----------------------------------------------------------------------------
// Styled Components
//-----------------------------------------------------------------------------
const Container = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.125rem 0;
  font-size: 0.9rem;
`

const Name = styled.div`
  width: 33%;
`

const Email = styled.div`
  position: relative;
  width: 33%;
  text-align: center;
`

const ErrorContainer = styled.div`
  position: absolute;
  top: calc(100% + 0.25rem);
  width: 100%;
  padding: 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgb(245, 245, 245);
  color: black;
  border: 1px solid rgb(100, 100, 100);
  border-radius: 5px;
`

const ErrorMessage = styled.div``

const ErrorButton = styled.div`
  cursor: pointer;
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(220, 220, 220);
  color: black;
  border: 1px solid rgb(100, 100, 100);
  border-radius: 5px;
  &:hover {
    background-color: ${ ({ userColorPrimary }: IErrorButton) => userColorPrimary };
    color: white;
  }
`
interface IErrorButton {
  userColorPrimary: string
}

const Actions = styled.div`
  width: 33%;
  display: flex;
  justify-content: flex-end;
`

const StyledInput = styled.input`
  padding: 0.125rem 0;
  width: 100%;
  border: none;
  background-color: transparent;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  text-align: ${ ({ textAlign = 'left' }: IStyledInput) => textAlign };
`
interface IStyledInput {
  textAlign: 'center' | 'left'
}

const Create = styled.div`
  cursor: pointer;
  padding: ${ ({ createPermissionStatus }: ICreate) => ['CREATED', 'CREATING'].includes(createPermissionStatus) ? '0.06rem 0.375rem' : '0.06rem 0.15rem' };
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  background-color: rgb(225, 225, 225);
  opacity: 0.8;
  &:hover {
    opacity: 1;
    background-color: rgb(0, 150, 0);
    color: white;
  }
`
interface ICreate {
  createPermissionStatus: ICreatePermissionStatus
}

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------
export default FoldersPropertiesPermissionsCreatePermission
