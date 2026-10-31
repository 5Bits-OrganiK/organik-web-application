import {UserResource} from './iam-response';

/**
 * Users of the minimarket while the backend is not available.
 */
export const USERS_SEED: UserResource[] = [
  {id: 'usr-1', fullName: 'Albino Caceres', email: 'albino@organik.pe', role: 'administrator', assignedModule: 'dashboard', status: 'accepted', notes: '', minimarketId: 'mm-vida-verde'},
  {id: 'usr-2', fullName: 'Cielo Atencio', email: 'cielo@organik.pe', role: 'operator', assignedModule: 'inventory', status: 'accepted', notes: '', minimarketId: 'mm-vida-verde'},
  {id: 'usr-3', fullName: 'Alexis Torres', email: 'alexis@organik.pe', role: 'supplier', assignedModule: 'requests', status: 'pending', notes: '', supplierId: 'sup-bioandes'},
  {id: 'usr-4', fullName: 'Marco Quispe', email: 'marco@bioandes.pe', role: 'supplier', assignedModule: 'catalog', status: 'accepted', notes: 'BioAndes Organic', supplierId: 'sup-bioandes'},
  {id: 'usr-5', fullName: 'Anita Gamboa', email: 'anita@gamboa.pe', role: 'supplier', assignedModule: 'catalog', status: 'accepted', notes: 'Anita Gamboa', supplierId: 'sup-anita-gamboa'},
  {id: 'usr-6', fullName: 'Luis Mendoza', email: 'luis@valleverde.pe', role: 'supplier', assignedModule: 'catalog', status: 'accepted', notes: 'Valle Verde', supplierId: 'sup-valle-verde'}
];
