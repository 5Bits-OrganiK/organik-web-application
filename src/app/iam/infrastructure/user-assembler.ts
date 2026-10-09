import {Injectable} from '@angular/core';
import {DomainError} from '../../shared/domain/model/domain-error';
import {EmailAddress} from '../../shared/domain/model/email-address';
import {MODULE_KEYS, ROLES} from '../domain/model/role';
import {User} from '../domain/model/user.entity';
import {UserResource, UsersResponse} from './iam-response';

/**
 * Maps user resources from the backend into User domain entities and back.
 */
@Injectable({providedIn: 'root'})
export class UserAssembler {
  /**
   * Converts a user resource into a User entity.
   *
   * @param resource - Raw user object returned by the backend.
   * @throws DomainError if the role or the assigned module is unknown.
   */
  toEntityFromResource(resource: UserResource): User {
    const role = ROLES.find(candidate => candidate.id === resource.role);
    const assignedModule = MODULE_KEYS.find(candidate => candidate === resource.assignedModule);
    if (!role || !assignedModule) {
      throw new DomainError(`Unknown role or module for user ${resource.id}`);
    }
    return new User({
      id: resource.id,
      fullName: resource.fullName,
      email: new EmailAddress(resource.email),
      role,
      assignedModule,
      status: resource.status === 'accepted' ? 'accepted' : 'pending',
      notes: resource.notes,
      minimarketId: resource.minimarketId ?? '',
      supplierId: resource.supplierId ?? null,
      plan: resource.plan ?? ''
    });
  }

  /**
   * Converts a users payload into User entities.
   *
   * @param response - Backend response with user resources.
   */
  toEntitiesFromResponse(response: UsersResponse): User[] {
    return response.users.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts a User entity into the resource sent to the backend.
   *
   * @param user - Entity to serialize.
   */
  toResourceFromEntity(user: User): UserResource {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email.toString(),
      role: user.role.id,
      assignedModule: user.assignedModule,
      status: user.status,
      notes: user.notes,
      minimarketId: user.minimarketId,
      supplierId: user.supplierId,
      plan: user.plan
    };
  }
}
