import { RouterModule, Routes } from "@angular/router";
import { UserComponent } from "../user/user.component";
import { NgModule } from "@angular/core";
import { AuthComponent } from "../auth/auth.component";
import { userdataResolver } from "../resolver/userdata.resolver";
import { prefdataResolver } from "../resolver/prefdata.resolver";
import { AuthGuard } from "../guard/auth.guard";
import { PreferenceComponent } from "../preference/preference.component";
import { RoleComponent } from "../role/role.component";
import { groupsDataResolver } from "../resolver/groupsdata.resolver";
import { GroupComponent } from "../group/group.component";
import { CategoryComponent } from "../category/category.component";
import { categoryDataResolver } from "../resolver/categorydata.resolver";
import { roleDataResolver } from "../resolver/roledata.resolver";
import { itemDataResolver } from "../resolver/itemdata.resolver";
import { ItemComponent } from "../item/item.component";
import { imageDataResolver } from "../resolver/imagedata.resolver";
import { ImageComponent } from "../image/image.component";
import { listDataResolver } from "../resolver/listdata.resolver";
import { ListComponent } from "../list/list.component";
import { capsDataResolver } from "../resolver/capsdata.resolver";
import { electionDataResolver } from "../resolver/electiondata.resolver";
import { ElectionComponent } from "../election/election.component";
import { Verify2FAComponent } from "../twofactor/verify/verify2fa.component";
import { Enable2FAComponent } from "../twofactor/enable2fa/enable2fa.component";
import { DashboardComponent } from "../dashboard/dashboard.component";
import { voteDataResolver } from "../resolver/votedata.resolver";
import { VoteComponent } from "../vote/vote.component";
import { RegisterComponent } from "../register/register.component";
import { PasswordResetComponent } from "../password/password-reset/password-reset.component";
import { PasswordRequestComponent } from "../password/password-request/password-request.component";
import { UserProfileComponent } from "../userprofile/userprofile.component";
import { AdminGuard } from "../guard/admin.guard";

const routes: Routes = [
    {path: 'users', resolve: { users: userdataResolver}, component: UserComponent, canActivate: [AuthGuard, AdminGuard]},
    {path: 'prefs', resolve: { preferences: prefdataResolver}, component: PreferenceComponent, canActivate: [AuthGuard]},
    {path: 'roles', resolve: { roles: roleDataResolver, caps: capsDataResolver}, component: RoleComponent, canActivate: [AuthGuard, AdminGuard]},
    {path: 'groups', resolve: { groups: groupsDataResolver}, component: GroupComponent, canActivate: [AuthGuard]},
    {path: 'categories', resolve: { categories: categoryDataResolver}, component: CategoryComponent, canActivate: [AuthGuard]},
    {path: 'items', resolve: { items: itemDataResolver}, component: ItemComponent, canActivate: [AuthGuard]},
    {path: 'images', resolve: { images: imageDataResolver}, component: ImageComponent, canActivate: [AuthGuard]},
    {path: 'lists', resolve: { lists: listDataResolver}, component: ListComponent, canActivate: [AuthGuard]},
    {path: 'elections', resolve: { elections: electionDataResolver}, component: ElectionComponent, canActivate: [AuthGuard]},
    {path: 'votes', resolve: { votes: voteDataResolver}, component: VoteComponent, canActivate: [AuthGuard,AdminGuard]},
    {path: 'pwdreset/:userid/:resettoken', component: PasswordResetComponent},
    {path: 'pwdrequest', component: PasswordRequestComponent},
    {path: 'auth/verify/:userid/:verificationtoken', component: Verify2FAComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'confirm/:registertoken', component: RegisterComponent},
    {path: '2fa', component: Enable2FAComponent, canActivate: [AuthGuard]},
    {path: 'auth', component: AuthComponent},
    {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
    {path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard]},
    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    {path: '**', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
    imports:[RouterModule.forRoot(routes)],
    exports:[RouterModule]
})
export class AppRoutingModule {}